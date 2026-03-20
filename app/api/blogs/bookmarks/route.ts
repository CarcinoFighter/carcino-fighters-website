import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "public_jwt";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const sb = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function hashToken(token: string) {
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(token).digest("hex");
}

function missingConfig() {
  return !supabaseUrl || !supabaseServiceKey || !sb || !jwtSecret;
}

async function getSession() {
  if (missingConfig() || !jwtSecret) return null;
  const cookieStore = await cookies();
  let token = cookieStore.get("jwt")?.value;
  let isPublicJwt = false;

  if (!token) {
    token = cookieStore.get("public_jwt")?.value;
    isPublicJwt = true;
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload & { sub: string };

    if (isPublicJwt) {
      const { data: user, error } = await sb!
        .from("users_public")
        .select("id, username, name, email, avatar_url, bio, deleted, is_banned")
        .eq("id", payload.sub)
        .limit(1)
        .maybeSingle();

      if (error || !user || user.deleted) return null;
      return { id: user.id, is_banned: !!user.is_banned };
    } else {
      const tokenHash = await hashToken(token);
      const { data: sessionRow } = await (sb!
        .from("login_sessions")
        .select("user_id, expires_at")
        .eq("token_hash", tokenHash)
        .maybeSingle() as any);

      if (!sessionRow) return null;
      if (sessionRow.expires_at && new Date(sessionRow.expires_at).getTime() < Date.now()) return null;
      if (sessionRow.user_id !== payload.sub) return null;

      const { data: empUser, error: empErr } = await sb!
        .from("users")
        .select("id, email, admin_access")
        .eq("id", payload.sub)
        .limit(1)
        .maybeSingle();

      if (empErr || !empUser) return null;

      const { data: pubUser } = await sb!
        .from("users_public")
        .select("id, is_banned")
        .eq("email", empUser.email.toLowerCase())
        .limit(1)
        .maybeSingle();

      if (!pubUser) return null;

      return { id: pubUser.id, is_banned: !!pubUser.is_banned };
    }
  } catch (e) {
    return null;
  }
}

function mapBlog(row: any) {
  const author = row?.users_public;
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    tags: row.tags,
    views: row.views,
    likes: row.likes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    hidden: row.hidden,
    authorName: author?.name ?? author?.username ?? null,
    authorUsername: author?.username ?? null,
    authorBio: author?.bio ?? null,
    avatarUrl: author?.avatar_url ?? null,
  };
}

export async function GET(req: Request) {
  try {
    if (missingConfig()) return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch the user's bookmarked blogs
    const { data: bookmarks, error: bookmarkError } = await sb!
      .from("blog_bookmarks")
      .select("blog_id")
      .eq("user_id", session.id);

    if (bookmarkError) return NextResponse.json({ error: bookmarkError.message }, { status: 400 });

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json({ blogs: [] });
    }

    const blogIds = bookmarks.map(b => b.blog_id);

    const { data: blogsData, error: blogsError } = await sb!
      .from("blogs")
      .select("id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, hidden, users_public!blogs_user_id_fkey(name, username, avatar_url, bio)")
      .in("id", blogIds)
      .eq("hidden", false)
      .order("created_at", { ascending: false });

    if (blogsError) return NextResponse.json({ error: blogsError.message }, { status: 400 });

    const blogs = (blogsData ?? []).map(mapBlog);
    return NextResponse.json({ blogs });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
