import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "public_jwt";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const sb = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

type BlogBody = {
  action?: "create" | "update" | "delete";
  id?: string;
  title?: string;
  slug?: string;
  content?: string | null;
  tags?: string[] | string | null;
};

function missingConfig() {
  return !supabaseUrl || !supabaseServiceKey || !sb || !jwtSecret;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

async function ensureUniqueSlug(baseSlug: string) {
  let candidate = baseSlug || "post";
  let counter = 1;
  while (true) {
    const { count } = await sb!
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("slug", candidate);

    if (!count || count === 0) break;
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return candidate;
}

async function hashToken(token: string) {
  const crypto = await import("node:crypto");
  return crypto.createHash("sha256").update(token).digest("hex");
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
        .select("id, username, name, email, avatar_url, bio, deleted")
        .eq("id", payload.sub)
        .limit(1)
        .maybeSingle();

      if (error || !user || user.deleted) return null;

      const { data: empUser } = await sb!
        .from("users")
        .select("id, admin_access")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      return {
        id: user.id, // This is the users_public ID
        username: user.username,
        email: user.email.toLowerCase(),
        avatar_url: user.avatar_url,
        bio: user.bio,
        admin_access: Boolean(empUser?.admin_access),
        is_public_session: true,
      };
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

      // payload.sub here is from the 'jwt' cookie, which is the employee table ID
      // We NEED the users_public table ID for the 'blogs' and 'blog_submissions' foreign keys.
      const { data: empUser, error: empErr } = await sb!
        .from("users")
        .select("id, email, admin_access")
        .eq("id", payload.sub)
        .limit(1)
        .maybeSingle();

      if (empErr || !empUser) return null;

      const { data: pubUser } = await sb!
        .from("users_public")
        .select("id, username, name, avatar_url, bio")
        .eq("email", empUser.email.toLowerCase())
        .limit(1)
        .maybeSingle();

      if (!pubUser) return null; // Every employee should have a public profile

      return {
        id: pubUser.id, // ALWAYS return the public user ID for database operations
        emp_id: empUser.id,
        username: pubUser.username,
        name: pubUser.name,
        email: empUser.email.toLowerCase(),
        avatar_url: pubUser.avatar_url,
        bio: pubUser.bio,
        admin_access: Boolean(empUser?.admin_access),
        is_public_session: false,
      };
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
    deleted: row.deleted,
    authorName: author?.name ?? author?.username ?? null,
    authorUsername: author?.username ?? null,
    authorBio: author?.bio ?? null,
    avatarUrl: author?.avatar_url ?? null,
  };
}

export async function GET(req: Request) {
  try {
    if (missingConfig()) return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });

    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine") === "true";
    const idsParam = searchParams.get("ids");
    const session = mine ? await getSession() : null;
    if (mine && !session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query = sb!
      .from("blogs")
      .select(
        "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
      )
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (mine && session?.id) {
      query.eq("user_id", session.id);
    }

    if (idsParam) {
      const ids = idsParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        query.in("id", ids);
      }
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const blogs = (data ?? []).map(mapBlog);

    // If 'mine', also fetch pending submissions
    if (mine && session?.id) {
      const { data: submissions, error: subErr } = await sb!
        .from("blog_submissions")
        .select("id, blog_id, title, slug, content, tags, status, created_at, updated_at")
        .eq("user_id", session.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!subErr && submissions) {
        const pendingBlogs = submissions.map((s) => ({
          id: s.id,
          submission_id: s.id,
          blog_id: s.blog_id,
          title: s.title,
          slug: s.slug,
          content: s.content,
          tags: s.tags,
          status: "pending",
          created_at: s.created_at,
          is_pending: true,
        }));
        // Merge them at the beginning
        return NextResponse.json({ blogs: [...pendingBlogs, ...blogs] });
      }
    }

    return NextResponse.json({ blogs });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "File uploads are not supported for blogs" }, { status: 400 });
    }

    if (missingConfig()) return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as BlogBody;
    const action = body.action ?? "create";

    const normalizedTags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string" && body.tags.length
        ? body.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : null;

    if (action === "create" || action === "update") {
      const submissionPayload: any = {
        user_id: session.id,
        title: body.title,
        slug: body.slug ? slugify(body.slug) : (body.title ? slugify(body.title) : undefined),
        content: body.content ?? null,
        tags: normalizedTags,
        status: "pending",
      };
      if (action === "update") {
        if (!body.id) return NextResponse.json({ error: "id is required for update submission" }, { status: 400 });
        // Check if body.id is a submission or a blog
        const { data: isBlog } = await sb!.from("blogs").select("id").eq("id", body.id).maybeSingle();
        if (isBlog) {
          submissionPayload.blog_id = body.id;
        } else {
          // If it's already a submission, we update that submission instead of creating a new one?
          // For simplicity, let's just delete the old one and create new, or just reject if it exists.
          // Actually, let's just update the existing submission if it exists.
          const { error: updateErr } = await sb!
            .from("blog_submissions")
            .update(submissionPayload)
            .eq("id", body.id)
            .eq("user_id", session.id)
            .eq("status", "pending");

          if (!updateErr) return NextResponse.json({ message: "Submission updated" }, { status: 202 });
        }
      }

      const { data, error } = await sb!
        .from("blog_submissions")
        .insert(submissionPayload)
        .select()
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ submission: data, message: "Blog post submitted for review" }, { status: 202 });
    }

    if (action === "delete") {
      if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      // Can delete own submission if it's pending
      const { data: sub } = await sb!.from("blog_submissions").select("id").eq("id", body.id).eq("user_id", session.id).eq("status", "pending").maybeSingle();
      if (sub) {
        await sb!.from("blog_submissions").delete().eq("id", body.id);
        return NextResponse.json({ ok: true });
      }

      // If it's a published blog, it falls through to admin check or forbidden
      if (!session.admin_access) {
        return NextResponse.json({ error: "Only admins can delete blogs directly" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
