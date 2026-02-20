import { unstable_cache } from "next/cache";
import { supabase } from "@/lib/initSupabase";

type RawStoryRow = {
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

export type SurvivorStory = {
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

export type SurvivorStorySummary = {
  id: string;
  slug: string;
  title: string;
  authorName: string | null;
};

function mapRow(row: RawStoryRow | null): SurvivorStory | null {
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

async function getStoryBySlugRaw(slug: string) {
  const { data, error } = await supabase
    .from("survivorstories")
    .select(
      "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
    )
    .eq("slug", slug)
    .eq("deleted", false)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getStoryBySlugRaw error", error);
    return null;
  }

  return mapRow(data as RawStoryRow | null);
}

const getStoryBySlugCached = unstable_cache(
  async (slug: string) => getStoryBySlugRaw(slug),
  ["survivorStoryBySlug"],
  { revalidate: 60, tags: ["survivor-stories"] }
);

export async function getSurvivorStoryBySlug(slug: string) {
  return getStoryBySlugCached(slug);
}

async function getAllStoriesRaw() {
  const { data, error } = await supabase
    .from("survivorstories")
    .select(
      "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
    )
    .eq("deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllStoriesRaw error", error);
    return [] as SurvivorStory[];
  }

  return (data as RawStoryRow[]).map(mapRow).filter(Boolean) as SurvivorStory[];
}

export const getAllSurvivorStories = unstable_cache(
  async () => getAllStoriesRaw(),
  ["survivorStoriesAll"],
  { revalidate: 60, tags: ["survivor-stories"] }
);

async function getRandomStoriesRaw(limit = 3, excludeSlug?: string) {
  const { data, error } = await supabase
    .from("survivorstories")
    .select(
      "id, user_id, title, slug, content, tags, views, likes, created_at, updated_at, deleted, users_public(name, username, avatar_url, bio)"
    )
    .eq("deleted", false)
    .limit(30);

  if (error) {
    console.error("getRandomStoriesRaw error", error);
    return [] as SurvivorStorySummary[];
  }

  const rows = (data as RawStoryRow[]).filter((row) => (excludeSlug ? row.slug !== excludeSlug : true));
  const shuffled = rows.sort(() => 0.5 - Math.random()).slice(0, limit);
  return shuffled.map((row) => {
    const mapped = mapRow(row);
    return {
      id: mapped?.id ?? row.id,
      slug: mapped?.slug ?? row.slug,
      title: mapped?.title ?? row.title,
      authorName: mapped?.authorName ?? mapped?.authorUsername ?? null,
    } as SurvivorStorySummary;
  });
}

const getRandomStoriesCached = unstable_cache(
  async (limit = 3, excludeSlug?: string) => getRandomStoriesRaw(limit, excludeSlug),
  ["survivorStoriesRandom"],
  { revalidate: 120, tags: ["survivor-stories"] }
);

export async function getRandomSurvivorStories(limit = 3, excludeSlug?: string) {
  return getRandomStoriesCached(limit, excludeSlug);
}