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

async function getSession() {
  if (missingConfig()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret!) as jwt.JwtPayload & { sub: string };
    const { data: user, error } = await sb!
      .from("users_public")
      .select("id, username, name, bio, avatar_url, deleted")
      .eq("id", payload.sub)
      .limit(1)
      .maybeSingle();

    if (error || !user || user.deleted) return null;
    return { id: user.id, username: user.username, name: user.name, bio: user.bio, avatar_url: user.avatar_url };
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

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const blogs = (data ?? []).map(mapBlog);
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

    if (action === "create") {
      if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 });
      const baseSlug = body.slug ? slugify(body.slug) : slugify(body.title);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      const { data, error } = await sb!
        .from("blogs")
        .insert({
          user_id: session.id,
          title: body.title,
          slug: uniqueSlug,
          content: body.content ?? null,
          tags: normalizedTags,
        })
        .select(
          "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
        )
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ blog: mapBlog(data) }, { status: 201 });
    }

    if (action === "update") {
      if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      const { data: existing, error: fetchErr } = await sb!
        .from("blogs")
        .select("id, user_id, slug")
        .eq("id", body.id)
        .limit(1)
        .maybeSingle();

      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 400 });
      if (!existing || existing.user_id !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (body.title !== undefined) updates.title = body.title;
      if (body.content !== undefined) updates.content = body.content;
      if (body.tags !== undefined) updates.tags = normalizedTags;

      if (body.slug !== undefined) {
        const candidate = body.slug ? slugify(body.slug) : existing.slug;
        updates.slug = await ensureUniqueSlug(candidate);
      }

      const { data, error } = await sb!
        .from("blogs")
        .update(updates)
        .eq("id", body.id)
        .select(
          "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
        )
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ blog: mapBlog(data) });
    }

    if (action === "delete") {
      if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      const { data: existing, error: fetchErr } = await sb!
        .from("blogs")
        .select("id, user_id")
        .eq("id", body.id)
        .limit(1)
        .maybeSingle();

      if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 400 });
      if (!existing || existing.user_id !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      const { error } = await sb!
        .from("blogs")
        .update({ deleted: true, updated_at: new Date().toISOString() })
        .eq("id", body.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
