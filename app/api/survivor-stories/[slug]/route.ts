import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

const sb = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

function mapStory(row: any) {
  const author = row?.users_public;
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    image_url: row.image_url,
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

export async function GET(
  _req: NextRequest,
  context: { params: { slug: string } | Promise<{ slug: string }> }
) {
  try {
    if (!sb || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    const params = await Promise.resolve(context.params);
    const slug = params.slug;

    const { data, error } = await sb
      .from("survivorstories")
      .select(
        "id, user_id, title, slug, content, image_url, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
      )
      .eq("deleted", false)
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ story: mapStory(data) }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}