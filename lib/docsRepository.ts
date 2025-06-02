// lib/docsRepository.ts
import { supabase } from '@/lib/initSupabase';

interface CancerDoc {
  id: string;
  slug: string;
  title: string | null | undefined;
  content: JSON;
  google_doc_id: string;
  last_updated: string | null | undefined;
}

export async function saveDocsToStorage(docs: Omit<CancerDoc, 'id'>[]) {
  try {
    // Upsert all documents in a transaction
    const { data, error } = await supabase
      .from('cancer_docs')
      .upsert(docs, { onConflict: 'google_doc_id' });
    
    if (error) {
      console.error('Error upserting docs:', {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error saving docs to Supabase:', error);
    throw error;
  }
}

export async function getDocById(id: string): Promise<CancerDoc | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('*')
      .eq('google_doc_id', id)
      .maybeSingle();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching doc with ID ${id}:`, error);
    return null;
  }
}

export async function getAllDocs(): Promise<CancerDoc[]> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching docs from Supabase:', error);
    return [];
  }
}

export async function getDocBySlug(slug: string): Promise<CancerDoc | null> {
  try {
    const { data, error } = await supabase
      .from('cancer_docs')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
      
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching doc with slug ${slug}:`, error);
    return null;
  }
}

export async function deleteDoc(id: string) {
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