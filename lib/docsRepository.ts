// lib/docsRepository.ts
import { supabase } from '@/lib/initSupabase';
import { getNotionArticles, getNotionArticleBySlug } from './notion';

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
  author_user_id?: string | null;
}

export interface ArticleWithAvatar extends Article { profilePicture?: string | null }

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  author: string | null;
}

export async function getDocBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document from Supabase:', error);
      return await getNotionArticleBySlug(slug);
    }

    if (!data) {
      return await getNotionArticleBySlug(slug);
    }

    const doc = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null };

    let author: string | null = null;
    let position: string | null = null;
    if (doc.author_user_id) {
      const { data: authorRow, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position')
        .eq('id', doc.author_user_id)
        .limit(1)
        .single();

      if (!authorErr && authorRow) {
        author = authorRow.name ?? authorRow.username ?? authorRow.email ?? null;
        position = authorRow.position ?? null;
      }
    }

    return { ...doc, author, position } as Article;
  } catch (error) {
    console.error('Error in getDocBySlug:', error);
  }


  const notionArticle = await getNotionArticleBySlug(slug);
  if (notionArticle) {

    if (notionArticle.author) {
      const { data: user } = await supabase
        .from('users')
        .select('position')
        .eq('name', notionArticle.author)
        .maybeSingle();

      if (user?.position) {
        notionArticle.position = user.position;
      }
    }
    return notionArticle;
  }
  return null;
}

export async function getDocBySlugWithAvatar(slug: string): Promise<ArticleWithAvatar | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Error fetching document from Supabase:', error);

      const notionArticle = await getNotionArticleBySlug(slug);
      if (notionArticle) {

        if (notionArticle.author) {
          const { data: user } = await supabase
            .from('users')
            .select('position')
            .eq('name', notionArticle.author)
            .maybeSingle();
          if (user?.position) {
            notionArticle.position = user.position;
          }
        }
        return { ...notionArticle, profilePicture: null } as ArticleWithAvatar;
      }
      return null;
    }

    const doc = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null };

    let author: string | null = null;
    let position: string | null = null;
    if (doc.author_user_id) {
      const { data: authorRow, error: authorErr } = await supabase
        .from('users')
        .select('id, name, username, email, position')
        .eq('id', doc.author_user_id)
        .limit(1)
        .single();

      if (!authorErr && authorRow) {
        author = authorRow.name ?? authorRow.username ?? authorRow.email ?? null;
        position = authorRow.position ?? null;
      }
    }

    let profilePicture: string | null = null;
    try {
      const res = await fetch(resolveApiUrl('/api/avatars'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [doc.id] })
      });
      if (res.ok) {
        const json = await res.json();
        profilePicture = json?.map?.[doc.id] ?? null;
      } else {
        console.warn('Avatar API failed', res.status);
      }
    } catch (e) {
      console.warn('Avatar API error', e);
    }

    return { ...doc, author, position, profilePicture } as ArticleWithAvatar;
  } catch (error) {
    console.error('Error in getDocBySlugWithAvatar:', error);

    const notionArticle = await getNotionArticleBySlug(slug);
    if (notionArticle) {

      if (notionArticle.author) {
        const { data: user } = await supabase
          .from('users')
          .select('position')
          .eq('name', notionArticle.author)
          .maybeSingle();
        if (user?.position) {
          notionArticle.position = user.position;
        }
      }
      return { ...notionArticle, profilePicture: null } as ArticleWithAvatar;
    }
    return null;
  }
}

export async function getAllDocs(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .order('title');

    let supabaseDocs: Article[] = [];
    if (data) {
      const docs = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null }[];
      const authorIds = Array.from(new Set(docs.map(d => d.author_user_id).filter(Boolean))) as string[];

      let authorMap: Record<string, { name: string | null; username: string | null; email: string | null; position: string | null }> = {};
      if (authorIds.length) {
        const { data: authors, error: authorErr } = await supabase
          .from('users')
          .select('id, name, username, email, position')
          .in('id', authorIds);
        if (authorErr) {
          console.error('Error fetching authors:', authorErr);
        } else {
          authorMap = Object.fromEntries(
            (authors ?? []).map(a => [a.id, { name: a.name ?? null, username: a.username ?? null, email: a.email ?? null, position: a.position ?? null }])
          );
        }
      }

      supabaseDocs = docs
        .filter((d) => d.author_user_id)
        .map((d) => {
          const meta = d.author_user_id ? authorMap[d.author_user_id] : undefined;
          const author = meta ? meta.name ?? meta.username ?? meta.email ?? null : null;
          const position = meta?.position ?? null;
          return { ...d, author, position } as Article;
        });
    }

    // Fetch metadata only (no content conversion) - FAST!
    const notionDocs = await getNotionArticles(false);

    const supabaseSlugs = new Set(supabaseDocs.map(d => d.slug));
    const uniqueNotionDocs = notionDocs.filter(d => !supabaseSlugs.has(d.slug));

    const enrichedNotionDocs = await Promise.all(uniqueNotionDocs.map(async (doc) => {
      if (doc.author) {
        const { data: user } = await supabase
          .from('users')
          .select('position')
          .eq('name', doc.author)
          .maybeSingle();
        if (user?.position) {
          return { ...doc, position: user.position };
        }
      }
      return doc;
    }));

    console.log(`Fetched ${supabaseDocs.length} Supabase docs and ${enrichedNotionDocs.length} Notion docs (after deduplication)`);
    return [...supabaseDocs, ...enrichedNotionDocs];
  } catch (error) {
    console.error('Error in getAllDocs:', error);
    const notionDocs = await getNotionArticles(false);
    return notionDocs;
  }
}

export async function getAllDocsWithAvatars(): Promise<ArticleWithAvatar[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, content, author_user_id')
      .order('title');

    if (error) console.error('Error fetching documents from Supabase:', error);

    let supabaseDocs: ArticleWithAvatar[] = [];
    if (data) {
      const docs = data as { id: string; slug: string; title: string; content: string; author_user_id: string | null }[];
      const authorIds = Array.from(new Set(docs.map(d => d.author_user_id).filter(Boolean))) as string[];

      let authorMap: Record<string, { name: string | null; username: string | null; email: string | null; position: string | null }> = {};
      if (authorIds.length) {
        const { data: authors, error: authorErr } = await supabase
          .from('users')
          .select('id, name, username, email, position')
          .in('id', authorIds);
        if (authorErr) {
          console.error('Error fetching authors:', authorErr);
        } else {
          authorMap = Object.fromEntries(
            (authors ?? []).map(a => [a.id, { name: a.name ?? null, username: a.username ?? null, email: a.email ?? null, position: a.position ?? null }])
          );
        }
      }


      let picMap: Record<string, string | null> = {};
      const ids = docs.map(d => d.id);
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

      supabaseDocs = docs
        .filter((d) => d.author_user_id)
        .map(d => {
          const meta = d.author_user_id ? authorMap[d.author_user_id] : undefined;
          const author = meta ? meta.name ?? meta.username ?? meta.email ?? null : null;
          const position = meta?.position ?? null;
          return { ...d, author, position, profilePicture: picMap[d.id] ?? null } as ArticleWithAvatar;
        });
    }

    // Fetch metadata only (no content conversion) - FAST!
    const notionDocs = await getNotionArticles(false);

    const supabaseSlugs = new Set(supabaseDocs.map(d => d.slug));
    const uniqueNotionDocs = notionDocs.filter(d => !supabaseSlugs.has(d.slug));

    const enrichedNotionDocs = await Promise.all(uniqueNotionDocs.map(async (doc) => {
      if (doc.author) {
        const { data: user } = await supabase
          .from('users')
          .select('position')
          .eq('name', doc.author)
          .maybeSingle();
        if (user?.position) {
          return { ...doc, position: user.position };
        }
      }
      return doc;
    }));

    const mappedNotionDocs: ArticleWithAvatar[] = enrichedNotionDocs.map(d => ({ ...d, profilePicture: null }));

    return [...supabaseDocs, ...mappedNotionDocs];
  } catch (error) {
    console.error('Error in getAllDocsWithAvatars:', error);
    const notionDocs = await getNotionArticles(false);
    return notionDocs.map(d => ({ ...d, profilePicture: null }));
  }
}

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

export async function getRandomArticleSummaries(limit = 3, excludeSlug?: string): Promise<ArticleSummary[]> {
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

    let docs = excludeSlug ? docsRaw.filter(d => d.slug !== excludeSlug) : docsRaw;

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

    // Fetch metadata only (no content conversion) - FAST! This is critical for performance.
    const notionDocs = await getNotionArticles(false);

    const supabaseSlugs = new Set(supabaseSummaries.map(d => d.slug));
    const uniqueNotionDocs = notionDocs.filter(d => !supabaseSlugs.has(d.slug));

    const enrichedNotionDocs = await Promise.all(uniqueNotionDocs.map(async (doc) => {
      if (doc.author) {
        const { data: user } = await supabase
          .from('users')
          .select('position')
          .eq('name', doc.author)
          .maybeSingle();
        if (user?.position) {
          return { ...doc, position: user.position };
        }
      }
      return doc;
    }));

    const notionSummaries = enrichedNotionDocs
      .filter(d => d.slug !== excludeSlug)
      .map(d => ({
        id: d.id,
        slug: d.slug,
        title: d.title,
        author: d.author ?? "Notion Author"
      }));

    const allSummaries = [...supabaseSummaries, ...notionSummaries];
    return allSummaries.sort(() => 0.5 - Math.random()).slice(0, limit);

  } catch (error) {
    console.error('Error in getRandomArticleSummaries:', error);
    return [];
  }
}