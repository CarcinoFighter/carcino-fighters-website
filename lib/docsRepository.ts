import { unstable_cache } from 'next/cache';
import { supabase } from '@/lib/initSupabase';
import { getAvatarUrls } from '@/lib/avatarService';
import { transformSupabaseUrl } from '@/lib/utils';

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

export interface IndividualAuthor {
  name: string;
  position: string;
  description: string;
  profilePicture: string | null;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  content?: string;
  position: string | null;
  authorDescription?: string | null;
  author_user_id?: string | null;
  author_user_ids?: string[];
  avatar_url?: string | null;
  authors?: IndividualAuthor[];
  color?: string | null;
  source?: 'community' | 'staff';
}

export interface ArticleWithAvatar extends Article {
  profilePicture?: string | null;
}

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  color?: string | null;
}

async function getDocBySlugUncached(slug: string): Promise<Article | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    let q = supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id, author_user_ids, color');

    if (isUuid) {
      q = q.or(`slug.eq.${slug},id.eq.${slug}`);
    } else {
      q = q.eq('slug', slug);
    }
    q = q.neq('hidden', true);

    const { data, error } = await q.maybeSingle();

    if (error || !data) {
      if (error) console.error('Error fetching document from Supabase:', error);
      return null;
    }

    const doc = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null; author_user_ids: string[] | null; color: string | null };

    let author: string | null = null;
    let position: string | null = null;
    let authorDescription: string | null = null;
    const idsToFetch = doc.author_user_ids && doc.author_user_ids.length > 0 ? doc.author_user_ids : (doc.author_user_id ? [doc.author_user_id] : []);
    
    if (idsToFetch.length > 0) {
      const { data: authorRows, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position, description')
        .in('id', idsToFetch);

      if (!authorErr && authorRows && authorRows.length > 0) {
        // We set the top-level author string to the first author or a joined string
        const authorNames = authorRows.map(row => row.name ?? row.username ?? row.email ?? "Unknown");
        author = authorNames.join(" and ");
        position = authorRows[0].position ?? null;
        authorDescription = authorRows[0].description ?? null;
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
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    let q = supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id, author_user_ids, color');

    if (isUuid) {
      q = q.or(`slug.eq.${slug},id.eq.${slug}`);
    } else {
      q = q.eq('slug', slug);
    }
    q = q.neq('hidden', true);

    const { data, error } = await q.maybeSingle();

    if (error || !data) {
      if (error) console.error('Error fetching document from Supabase:', error);
      return null;
    }

    const doc = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null; author_user_ids: string[] | null; color: string | null };

    let author: string | null = null;
    let position: string | null = null;
    let authorDescription: string | null = null;
    let avatarUrlFallback: string | null = null;
    let authors: IndividualAuthor[] = [];

    const idsToFetch = doc.author_user_ids && doc.author_user_ids.length > 0 ? doc.author_user_ids : (doc.author_user_id ? [doc.author_user_id] : []);
    
    if (idsToFetch.length > 0) {
      const { data: authorRows, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position, description, avatar_url')
        .in('id', idsToFetch);

      if (!authorErr && authorRows && authorRows.length > 0) {
        // Try maintaining ordered rows based on the array sequence
        const orderedRows = idsToFetch.map(id => authorRows.find(r => r.id === id)).filter(Boolean) as typeof authorRows;

        const authorIds = orderedRows.map(r => r.id);
        const picMap = await getAvatarUrls(authorIds);

        authors = orderedRows.map(row => ({
          name: row.name ?? row.username ?? row.email ?? "Unknown Author",
          position: row.position ?? "Researcher",
          description: row.description ?? "Researcher at The Carcino Foundation.",
          profilePicture: picMap[row.id] ?? row.avatar_url ?? null
        }));

        const authorNames = authors.map(a => a.name);
        author = authorNames.join(" and ");
        position = authors[0].position ?? null;
        authorDescription = authors[0].description ?? null;
        avatarUrlFallback = authors[0].profilePicture ?? null;
      }
    }

    if (authors.length === 0) {
      authors = [{
        name: author ?? "Unknown Author",
        position: position ?? "",
        description: authorDescription ?? "Researcher at The Carcino Foundation.",
        profilePicture: avatarUrlFallback || null
      }];
    }

    return { ...doc, author, position, authorDescription, profilePicture: authors[0]?.profilePicture ?? null, authors } as ArticleWithAvatar;
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
      .select('id, slug, title, author_user_id, author_user_ids, color')
      .neq('hidden', true)
      .order('title');

    if (!data) return [];

    const docs = data as { id: string; slug: string; title: string; author_user_id: string | null; author_user_ids: string[] | null; color: string | null }[];
    const authorIdsSet = new Set<string>();
    docs.forEach(d => {
      if (d.author_user_ids && d.author_user_ids.length > 0) d.author_user_ids.forEach(id => authorIdsSet.add(id));
      else if (d.author_user_id) authorIdsSet.add(d.author_user_id);
    });
    const authorIds = Array.from(authorIdsSet);

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
      const idsToUse = d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : (d.author_user_id ? [d.author_user_id] : []);
      const metas = idsToUse.map(id => authorMap[id]).filter(Boolean);
      
      const authorNames = metas.map(meta => meta.name ?? meta.username ?? meta.email ?? "Unknown");
      const author = authorNames.length > 0 ? authorNames.join(" and ") : null;
      const position = metas[0]?.position ?? null;
      const authorDescription = metas[0]?.description ?? null;
      
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
      .select('id, slug, title, author_user_id, author_user_ids, color')
      .neq('hidden', true)
      .order('title');

    if (error) console.error('Error fetching documents from Supabase:', error);

    if (!data) return [];

    const docs = data as { id: string; slug: string; title: string; author_user_id: string | null; author_user_ids: string[] | null; color: string | null }[];
    const authorIdsSet = new Set<string>();
    docs.forEach(d => {
      if (d.author_user_ids && d.author_user_ids.length > 0) d.author_user_ids.forEach(id => authorIdsSet.add(id));
      else if (d.author_user_id) authorIdsSet.add(d.author_user_id);
    });
    const authorIds = Array.from(authorIdsSet);

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
    const idsToFetchPics = Array.from(new Set([...authorIds, ...docs.map(d => d.id)])).filter(Boolean);
    try {
      picMap = await getAvatarUrls(idsToFetchPics);
    } catch (e) {
      console.warn('Avatars fetch error', e);
    }

    return docs.map(d => {
      const idsToUse = d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : (d.author_user_id ? [d.author_user_id] : []);
      const metas = idsToUse.map(id => authorMap[id]).filter(Boolean);
      
      const authorNames = metas.map(meta => meta.name ?? meta.username ?? meta.email ?? "Unknown");
      const author = authorNames.length > 0 ? authorNames.join(" and ") : null;
      const position = metas[0]?.position ?? null;
      const authorDescription = metas[0]?.description ?? null;
      
      const primaryAuthorId = idsToUse[0] || d.id;
      return { ...d, author, position, authorDescription, profilePicture: picMap[primaryAuthorId] ?? null } as ArticleWithAvatar;
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
      .select('id, slug, title, author_user_id, author_user_ids, color')
      .neq('hidden', true)
      .limit(20);

    if (error || !data) {
      if (error) {
        console.error('Error fetching random article summaries:', error);
      }
      return [];
    }

    const docsRaw = data as { id: string; slug: string; title: string; author_user_id: string | null; author_user_ids: string[] | null; color: string | null }[];

    const docs = excludeSlug ? docsRaw.filter(d => d.slug !== excludeSlug) : docsRaw;

    const shuffled = docs.sort(() => 0.5 - Math.random()).slice(0, limit);

    const authorIdsSet = new Set<string>();
    shuffled.forEach(d => {
      if (d.author_user_ids && d.author_user_ids.length > 0) d.author_user_ids.forEach(id => authorIdsSet.add(id));
      else if (d.author_user_id) authorIdsSet.add(d.author_user_id);
    });
    const authorIds = Array.from(authorIdsSet);
    
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

    const supabaseSummaries = shuffled.map(d => {
      const idsToUse = d.author_user_ids && d.author_user_ids.length > 0 ? d.author_user_ids : (d.author_user_id ? [d.author_user_id] : []);
      const authorNames = idsToUse.map(id => authorMap[id]).filter(Boolean);
      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        author: authorNames.length > 0 ? authorNames.join(" and ") : "Unknown Author",
        color: d.color
      };
    });
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
      picMap = await getAvatarUrls(ids);
    } catch (e) {
      console.warn('Avatars fetch error in leadership:', e);
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
        avatar_url: transformSupabaseUrl(u.avatar_url) ?? null,
        profilePicture: picMap[u.id] || transformSupabaseUrl(u.avatar_url) || null
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