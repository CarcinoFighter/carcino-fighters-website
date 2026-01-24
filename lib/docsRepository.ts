// lib/docsRepository.ts
import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/initSupabase';

function resolveApiUrl(path: string) {
  if (typeof window !== 'undefined') {
    return path;
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)
    || 'http://localhost:3000';

  try {
    return new URL(path, base).toString();
  } catch (error) {
    console.warn('Failed to resolve API URL', { path, base, error });
    return path;
  }
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  content: string;
  position: string | null;
  authorDescription?: string | null;
  author_user_id?: string | null;
  avatar_url?: string | null;
}

export interface ArticleWithAvatar extends Article { profilePicture?: string | null }

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  author: string | null;
}

async function getDocBySlugUncached(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Error fetching document from Supabase:', error);
      return null;
    }

    const doc = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null };

    let author: string | null = null;
    let position: string | null = null;
    let authorDescription: string | null = null;
    if (doc.author_user_id) {
      const { data: authorRow, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position, description')
        .eq('id', doc.author_user_id)
        .limit(1)
        .single();

      if (!authorErr && authorRow) {
        author = authorRow.name ?? authorRow.username ?? authorRow.email ?? null;
        position = authorRow.position ?? null;
        authorDescription = authorRow.description ?? null;
      }
    }

    return { ...doc, author, position, authorDescription } as Article;
  } catch (error) {
    console.error('Error in getDocBySlug:', error);
  }

  return null;
}

const getDocBySlugCached = unstable_cache(
  async (slug: string) => getDocBySlugUncached(slug),
  ['getDocBySlug'],
  { revalidate: 60, tags: ['articles'] }
);

export async function getDocBySlug(slug: string): Promise<Article | null> {
  return getDocBySlugCached(slug);
}

async function getDocBySlugWithAvatarUncached(slug: string): Promise<ArticleWithAvatar | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Error fetching document from Supabase:', error);
      return null;
    }

    const doc = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null };

    let author: string | null = null;
    let position: string | null = null;
    let authorDescription: string | null = null;
    let avatarUrlFallback: string | null = null;
    if (doc.author_user_id) {
      const { data: authorRow, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position, description, avatar_url')
        .eq('id', doc.author_user_id)
        .limit(1)
        .single();

      if (!authorErr && authorRow) {
        author = authorRow.name ?? authorRow.username ?? authorRow.email ?? null;
        position = authorRow.position ?? null;
        authorDescription = authorRow.description ?? null;
        avatarUrlFallback = authorRow.avatar_url ?? null;
      }
    }

    let profilePicture: string | null = null;
    try {
      const res = await fetch(resolveApiUrl('/api/avatars'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [doc.author_user_id || doc.id] })
      });
      if (res.ok) {
        const json = await res.json();
        profilePicture = json?.map?.[doc.author_user_id || doc.id] ?? null;
      } else {
        console.warn('Avatar API failed', res.status);
      }
    } catch (e) {
      console.warn('Avatar API error', e);
    }

    const finalPfp = profilePicture || avatarUrlFallback || null;

    return { ...doc, author, position, authorDescription, profilePicture: finalPfp } as ArticleWithAvatar;
  } catch (error) {
    console.error('Error in getDocBySlugWithAvatar:', error);
    return null;
  }
}

const getDocBySlugWithAvatarCached = unstable_cache(
  async (slug: string) => getDocBySlugWithAvatarUncached(slug),
  ['getDocBySlugWithAvatar'],
  { revalidate: 60, tags: ['articles'] }
);

export async function getDocBySlugWithAvatar(slug: string): Promise<ArticleWithAvatar | null> {
  return getDocBySlugWithAvatarCached(slug);
}

async function getAllDocsUncached(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .order('title');

    if (!data) return [];

    const docs = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null }[];
    const authorIds = Array.from(new Set(docs.map(d => d.author_user_id).filter(Boolean))) as string[];

    let authorMap: Record<string, { name: string | null; username: string | null; email: string | null; position: string | null; description: string | null }> = {};
    if (authorIds.length) {
      const { data: authors, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position, description')
        .in('id', authorIds);
      if (authorErr) {
        console.error('Error fetching authors:', authorErr);
      } else {
        authorMap = Object.fromEntries(
          (authors ?? []).map(a => [a.id, { name: a.name ?? null, username: a.username ?? null, email: a.email ?? null, position: a.position ?? null, description: a.description ?? null }])
        );
      }
    }

    return docs.map((d) => {
      const meta = d.author_user_id ? authorMap[d.author_user_id] : undefined;
      const author = meta ? meta.name ?? meta.username ?? meta.email ?? null : null;
      const position = meta?.position ?? null;
      const authorDescription = meta?.description ?? null;
      return { ...d, author, position, authorDescription } as Article;
    });
  } catch (error) {
    console.error('Error in getAllDocs:', error);
    return [];
  }
}

export const getAllDocs = unstable_cache(
  async () => getAllDocsUncached(),
  ['getAllDocs'],
  { revalidate: 60, tags: ['articles', 'article-list'] }
);

async function getAllDocsWithAvatarsUncached(): Promise<ArticleWithAvatar[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .order('title');

    if (error) console.error('Error fetching documents from Supabase:', error);

    if (!data) return [];

    const docs = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null }[];
    const authorIds = Array.from(new Set(docs.map(d => d.author_user_id).filter(Boolean))) as string[];

    let authorMap: Record<string, { name: string | null; username: string | null; email: string | null; position: string | null; description: string | null }> = {};
    if (authorIds.length) {
      const { data: authors, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position, description')
        .in('id', authorIds);
      if (authorErr) {
        console.error('Error fetching authors:', authorErr);
      } else {
        authorMap = Object.fromEntries(
          (authors ?? []).map(a => [a.id, { name: a.name ?? null, username: a.username ?? null, email: a.email ?? null, position: a.position ?? null, description: a.description ?? null }])
        );
      }
    }


    let picMap: Record<string, string | null> = {};
    const ids = Array.from(new Set(docs.map(d => d.author_user_id || d.id))).filter(Boolean) as string[];
    try {
      const res = await fetch(resolveApiUrl('/api/avatars'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        const json = await res.json();
        picMap = json?.map || {};
      }
    } catch (e) {
      console.warn('Avatars API error', e);
    }

    return docs.map(d => {
      const meta = d.author_user_id ? authorMap[d.author_user_id] : undefined;
      const author = meta ? meta.name ?? meta.username ?? meta.email ?? null : null;
      const position = meta?.position ?? null;
      const authorDescription = meta?.description ?? null;
      return { ...d, author, position, authorDescription, profilePicture: picMap[d.author_user_id || d.id] ?? null } as ArticleWithAvatar;
    });
  } catch (error) {
    console.error('Error in getAllDocsWithAvatars:', error);
    return [];
  }
}

export const getAllDocsWithAvatars = unstable_cache(
  async () => getAllDocsWithAvatarsUncached(),
  ['getAllDocsWithAvatars'],
  { revalidate: 60, tags: ['articles', 'article-list'] }
);

export async function deleteDoc(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cancer_docs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting doc:', error);
    return false;
  }
}

async function getRandomArticleSummariesUncached(limit = 3, excludeSlug?: string): Promise<ArticleSummary[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, author_user_id')
      .limit(20);

    if (error || !data) {
      if (error) {
        console.error('Error fetching random article summaries:', error);
      }
      return [];
    }

    const docsRaw = data as { id: string; slug: string; title: string; author_user_id: string | null }[];

    const docs = excludeSlug ? docsRaw.filter(d => d.slug !== excludeSlug) : docsRaw;

    const shuffled = docs.sort(() => 0.5 - Math.random()).slice(0, limit);

    const authorIds = Array.from(new Set(shuffled.map(d => d.author_user_id).filter(Boolean))) as string[];
    let authorMap: Record<string, string | null> = {};

    if (authorIds.length > 0) {
      const { data: authors, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email')
        .in('id', authorIds);

      if (authorErr) {
        console.error('Error fetching authors for summaries:', authorErr);
      } else {
        authors?.forEach(a => {
          authorMap[a.id] = a.name ?? a.username ?? a.email ?? null;
        });
      }
    }

    const supabaseSummaries = shuffled.map(d => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      author: (d.author_user_id ? authorMap[d.author_user_id] : null) ?? "Unknown Author"
    }));
    return supabaseSummaries.sort(() => 0.5 - Math.random()).slice(0, limit);

  } catch (error) {
    console.error('Error in getRandomArticleSummaries:', error);
    return [];
  }
}

const getRandomArticleSummariesCached = unstable_cache(
  async (limit = 3, excludeSlug?: string) => getRandomArticleSummariesUncached(limit, excludeSlug),
  ['getRandomArticleSummaries'],
  { revalidate: 300, tags: ['articles', 'article-list'] }
);

export async function getRandomArticleSummaries(limit = 3, excludeSlug?: string): Promise<ArticleSummary[]> {
  return getRandomArticleSummariesCached(limit, excludeSlug);
}

export interface LeadershipMember {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  position: string | null;
  description: string | null;
  profilePicture: string | null;
  avatar_url: string | null;
}

async function getLeadershipMembersUncached(): Promise<Record<string, LeadershipMember>> {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, username, email, position, description, avatar_url')
      .order('id');

    if (error || !users) {
      if (error) console.error('Error fetching leadership members:', error);
      return {};
    }

    const ids = users.map(u => u.id);
    let picMap: Record<string, string | null> = {};
    try {
      const res = await fetch(resolveApiUrl('/api/avatars'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        const json = await res.json();
        picMap = json?.map || {};
      }
    } catch (e) {
      console.warn('Avatars API error in leadership:', e);
    }

    const map: Record<string, LeadershipMember> = {};
    users.forEach(u => {
      const member: LeadershipMember = {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        position: u.position,
        description: u.description,
        avatar_url: u.avatar_url,
        profilePicture: picMap[u.id] || u.avatar_url || null
      };
      if (u.username) map[u.username.toLowerCase()] = member;
      // Also map by name if possible for flexibility
      if (u.name) map[u.name.toLowerCase()] = member;
    });

    return map;
  } catch (error) {
    console.error('Error in getLeadershipMembers:', error);
    return {};
  }
}

export const getLeadershipMembers = unstable_cache(
  async () => getLeadershipMembersUncached(),
  ['getLeadershipMembers'],
  { revalidate: 60, tags: ['leadership', 'users'] }
);