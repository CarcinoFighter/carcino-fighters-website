import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { transformSupabaseUrl } from "@/lib/utils";

const COOKIE_NAME = "jwt";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;
const STORY_BUCKET = "survivor-story-images";

const sb = (supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null) as any;

type StoryBody = {
  action?: "create" | "update" | "delete";
  id?: string;
  title?: string;
  slug?: string;
  content?: string | null;
  image_url?: string | null;
  colour?: string | null;
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
  let candidate = baseSlug || "story";
  let counter = 1;
  while (true) {
    const { count } = await sb!
      .from("survivorstories")
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
    const tokenHash = await hashToken(token);

    if (isPublicJwt) {
      const { data: user, error } = await sb!
        .from("users_public")
        .select("id, username, name, email, avatar_url, bio")
        .eq("id", payload.sub)
        .limit(1)
        .maybeSingle();

      if (error || !user) return null;

      const { data: empUser } = await sb!
        .from("users")
        .select("id, admin_access")
        .eq("email", user.email.toLowerCase())
        .maybeSingle();

      return {
        id: user.id, // This is users_public ID
        username: user.username,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        admin_access: Boolean(empUser?.admin_access),
        employee_id: empUser?.id || null,
        is_public_session: true,
      };
    } else {
      const { data: sessionRow, error: sessionErr } = await (sb!
        .from("login_sessions")
        .select("user_id, expires_at")
        .eq("token_hash", tokenHash)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle() as any);

      if (sessionErr || !sessionRow) return null;
      if (sessionRow.expires_at && new Date(sessionRow.expires_at).getTime() < Date.now()) return null;
      if (sessionRow.user_id !== payload.sub) return null;

      // payload.sub is the employee ID from jwt cookie
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

      if (!pubUser) return null;

      return {
        id: pubUser.id, // IMPORTANT: Use public ID for consistency
        username: pubUser.username,
        name: pubUser.name,
        email: empUser.email,
        avatar_url: pubUser.avatar_url,
        bio: pubUser.bio,
        admin_access: Boolean(empUser.admin_access),
        employee_id: empUser.id,
        is_public_session: false,
      };
    }
  } catch (e) {
    return null;
  }
}

async function handleUploadImage(req: Request) {
  if (missingConfig()) {
    return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
  }

  const session = await getSession();
  if (!session?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "image file is required" }, { status: 400 });

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `stories/${session.id}/${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await sb!
    .storage
    .from(STORY_BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type || "application/octet-stream", upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data: pub } = sb!.storage.from(STORY_BUCKET).getPublicUrl(path);
  const image_url = pub?.publicUrl || null;

  return NextResponse.json({ image_url });
}

function mapStory(row: any) {
  const author = row?.users;
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    image_url: transformSupabaseUrl(row.image_url),
    colour: row.colour,
    tags: row.tags,
    views: row.views,
    likes: row.likes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted: row.deleted,
    authorName: author?.name ?? author?.username ?? null,
    authorUsername: author?.username ?? null,
    authorBio: author?.description ?? null,
    avatarUrl: transformSupabaseUrl(author?.avatar_url) ?? null,
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
      .from("survivorstories")
      .select(
        "id, user_id, title, slug, content, image_url, colour, tags, views, likes, created_at, updated_at, deleted, users(name, username, avatar_url, description)"
      )
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (mine && session?.id) {
      query.eq("user_id", session.id);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const communityStories = (data ?? []).map(mapStory).map(s => ({ ...s, source: 'community' }));
    
    // Fetch staff stories
    const { getStaffSurvivorStories } = await import("@/lib/carcinoWork");
    const staffStories = await getStaffSurvivorStories();
    
    // Merge and sort
    const stories = [...communityStories, ...staffStories].sort((a: any, b: any) => 
      new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()
    );

    if (mine && session?.id) {
      const { data: submissions, error: subErr } = await sb!
        .from("survivor_story_submissions")
        .select("id, story_id, title, slug, content, image_url, colour, tags, status, created_at, updated_at")
        .eq("user_id", session.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!subErr && submissions) {
        const pendingStories = submissions.map((s: any) => ({
          id: s.id,
          submission_id: s.id,
          story_id: s.story_id,
          title: s.title,
          slug: s.slug,
          content: s.content,
          image_url: transformSupabaseUrl(s.image_url),
          colour: s.colour,
          tags: s.tags,
          status: "pending",
          created_at: s.created_at,
          is_pending: true,
        }));
        return NextResponse.json({ stories: [...pendingStories, ...stories] });
      }
    }

    return NextResponse.json({ stories });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return handleUploadImage(req);
    }

    if (missingConfig()) return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as StoryBody;
    const action = body.action ?? "create";

    const normalizedTags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === "string" && body.tags.length
        ? body.tags.split(",").map((t: any) => t.trim()).filter(Boolean)
        : null;

    if (action === "create" || action === "update") {
      const submissionPayload: any = {
        user_id: session.id,
        title: body.title,
        slug: body.slug ? slugify(body.slug) : (body.title ? slugify(body.title) : undefined),
        content: body.content ?? null,
        image_url: body.image_url ?? null,
        colour: body.colour ?? null,
        tags: normalizedTags,
        status: "pending",
      };
      if (action === "update") {
        if (!body.id) return NextResponse.json({ error: "id is required for update submission" }, { status: 400 });

        // Check if it's a story or a submission
        const { data: isStory } = await sb!.from("survivorstories").select("id").eq("id", body.id).maybeSingle();
        if (isStory) {
          submissionPayload.story_id = body.id;
        } else {
          // It's a submission update
          const { error: updateErr } = await sb!
            .from("survivor_story_submissions")
            .update(submissionPayload)
            .eq("id", body.id)
            .eq("user_id", session.id)
            .eq("status", "pending");

          if (!updateErr) return NextResponse.json({ message: "Submission updated" }, { status: 202 });
        }
      }

      const { data, error } = await sb!
        .from("survivor_story_submissions")
        .insert(submissionPayload)
        .select()
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ submission: data, message: "Story submitted for review" }, { status: 202 });
    }

    if (action === "delete") {
      if (!body.id) return NextResponse.json({ error: "id is required" }, { status: 400 });

      // Can delete own submission if pending
      const { data: sub } = await sb!.from("survivor_story_submissions").select("id").eq("id", body.id).eq("user_id", session.id).eq("status", "pending").maybeSingle();
      if (sub) {
        await sb!.from("survivor_story_submissions").delete().eq("id", body.id);
        return NextResponse.json({ ok: true });
      }

      if (!session.admin_access) {
        return NextResponse.json({ error: "Only admins can delete stories directly" }, { status: 403 });
      }
    }

    return NextResponse.json({ error: "Unknown action or unauthorized" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}