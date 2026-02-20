import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/initSupabase";

export type RawBlogRow = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string | null;
  tags: string[] | null;
  views: number | null;
  likes: number | null;
  created_at: string;
  updated_at: string;
  deleted: boolean | null;
  users_public?:
    | {
        name: string | null;
        username: string | null;
        avatar_url: string | null;
        bio: string | null;
      }
    | {
        name: string | null;
        username: string | null;
        avatar_url: string | null;
        bio: string | null;
      }[]
    | null;
};

export type BlogEntry = {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string | null;
  tags: string[] | null;
  views: number | null;
  likes: number | null;
  created_at: string;
  updated_at: string;
  deleted: boolean | null;
  authorName: string | null;
  authorUsername: string | null;
  authorBio: string | null;
  avatarUrl: string | null;
};

export type BlogSummary = {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
};

function mapRow(row: RawBlogRow | null): BlogEntry | null {
  if (!row) return null;
  const author = Array.isArray(row.users_public) ? row.users_public[0] : row.users_public;
  const authorName = author?.name ?? author?.username ?? null;
  const authorUsername = author?.username ?? null;
  const authorBio = author?.bio ?? null;
  const avatarUrl = author?.avatar_url ?? null;

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
    authorName,
    authorUsername,
    authorBio,
    avatarUrl,
  };
}

async function getBlogBySlugRaw(slug: string) {
  const { data, error } = await supabase
    .from("blogs")
    .select(
      "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
    )
    .eq("slug", slug)
    .eq("deleted", false)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getBlogBySlugRaw error", error);
    return null;
  }

  return mapRow(data as RawBlogRow | null);
}

const getBlogBySlugCached = unstable_cache(
  async (slug: string) => getBlogBySlugRaw(slug),
  ["blogsBySlug"],
  { revalidate: 60, tags: ["blogs"] }
);

export async function getBlogBySlug(slug: string) {
  return getBlogBySlugCached(slug);
}

async function getAllBlogsRaw() {
  const { data, error } = await supabase
    .from("blogs")
    .select(
      "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
    )
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllBlogsRaw error", error);
    return [] as BlogEntry[];
  }

  return (data as RawBlogRow[]).map(mapRow).filter(Boolean) as BlogEntry[];
}

export const getAllBlogs = unstable_cache(
  async () => getAllBlogsRaw(),
  ["blogsAll"],
  { revalidate: 60, tags: ["blogs"] }
);

async function getRandomBlogsRaw(limit = 3, excludeSlug?: string) {
  const { data, error } = await supabase
    .from("blogs")
    .select(
      "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
    )
    .eq("deleted", false)
    .limit(30);

  if (error) {
    console.error("getRandomBlogsRaw error", error);
    return [] as BlogSummary[];
  }

  const rows = (data as RawBlogRow[]).filter((row) => (excludeSlug ? row.slug !== excludeSlug : true));
  const shuffled = rows.sort(() => 0.5 - Math.random()).slice(0, limit);
  return shuffled.map((row) => {
    const mapped = mapRow(row);
    return {
      id: mapped?.id ?? row.id,
      slug: mapped?.slug ?? row.slug,
      title: mapped?.title ?? row.title,
      authorName: mapped?.authorName ?? mapped?.authorUsername ?? null,
    } as BlogSummary;
  });
}

const getRandomBlogsCached = unstable_cache(
  async (limit = 3, excludeSlug?: string) => getRandomBlogsRaw(limit, excludeSlug),
  ["blogsRandom"],
  { revalidate: 120, tags: ["blogs"] }
);

export async function getRandomBlogs(limit = 3, excludeSlug?: string) {
  return getRandomBlogsCached(limit, excludeSlug);
}
