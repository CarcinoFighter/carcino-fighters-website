// lib/docsRepository.ts
import { supabase } from '@/lib/initSupabase';

export interface Article {
  id: string;
  slug: string;
  title: string;
  author: string;
  content: string;
  position: string;
}

export async function getDocBySlug(slug: string): Promise<Article | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('*')
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

export async function getAllDocs(): Promise<Article[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('*')
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