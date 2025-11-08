// lib/docsRepository.ts
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
      .select('id, slug, title, author, content, position')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      return null;
    }

    return data as Article;
  } catch (error) {
    console.error('Error in getDocBySlug:', error);
    return null;
  }
}

export async function getDocBySlugWithAvatar(slug: string): Promise<ArticleWithAvatar | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, author, content, position')
      .eq('slug', slug)
      .single();

    if (error || !data) { if (error) console.error('Error fetching document:', error); return null }

    const doc = data as Article;

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

    return { ...doc, profilePicture } as ArticleWithAvatar;
  } catch (error) {
    console.error('Error in getDocBySlugWithAvatar:', error);
    return null;
  }
}

export async function getAllDocs(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, author, content, position')
      .order('title');

    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data as Article[];
  } catch (error) {
    console.error('Error in getAllDocs:', error);
    return [];
  }
}

export async function getAllDocsWithAvatars(): Promise<ArticleWithAvatar[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('id, slug, title, author, content, position')
      .order('title');

    if (error || !data) { if (error) console.error('Error fetching documents:', error); return [] }

    const docs = data as Article[];
    if (!docs.length) return [];

    // Prefer server API for signing URLs
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
      } else {
        console.warn('Avatars API failed', res.status);
      }
    } catch (e) {
      console.warn('Avatars API error', e);
    }

    return docs.map(d => ({ ...d, profilePicture: picMap[d.id] ?? null }));
  } catch (error) {
    console.error('Error in getAllDocsWithAvatars:', error);
    return [];
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
    let query = supabase
      .from('cancer_docs_random')
      .select('id, slug, title, author')

    if (excludeSlug) {
      query = query.neq('slug', excludeSlug);
    }

    const { data, error } = await query.limit(limit);

    if (error || !data) {
      if (error) {
        console.error('Error fetching random article summaries:', error);
      }
      return [];
    }

    return data as ArticleSummary[];
  } catch (error) {
    console.error('Error in getRandomArticleSummaries:', error);
    return [];
  }
}