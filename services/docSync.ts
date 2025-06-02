// services/docSync.ts
import { drive_v3 } from 'googleapis';
import { getDocJson, getGoogleDriveFiles } from '@/lib/googleDrive';
import { deleteDoc, getAllDocs, getDocById, saveDocsToStorage } from '@/lib/docsRepository';

interface SyncStats {
  checked: number;
  updated: number;
  created: number;
  errors: number;
  removed: number;
}

interface CancerDoc {
  slug: string;
  title: string | null | undefined;
  content: any; 
  google_doc_id: string;
  last_updated: string | null | undefined;
}


export async function startDocSync(): Promise<SyncStats> {
  const stats: SyncStats = {
    checked: 0,
    updated: 0,
    created: 0,
    removed: 0,
    errors: 0
  };


  try {
    console.log('Initializing Google Drive API...');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not configured');
    }

    console.log('Fetching documents from Google Drive...');
    const google_docs = await getGoogleDriveFiles(folderId);
    const supabase_docs = await getAllDocs();

    if (!google_docs.files?.length) {
      console.warn('No documents found in Google Drive folder');
      return stats;
    }
    console.log(`Found ${google_docs.files.length} documents to process`);

    console.log('Found documents in Supabase:', supabase_docs.length);
    console.log(`Found ${google_docs.files.length} documents in Google Drive`);
    if (supabase_docs.length > google_docs.files?.length!) {

      for (const doc of supabase_docs) {
        const existsInDrive = google_docs.files?.some(file => file.id === doc.google_doc_id);
        if (!existsInDrive) {
          console.log(`Removing document not found in Drive: ${doc.title}`);
          await deleteDoc(doc.id);
          stats.removed++;
          break
        }
      }

    }

    // Process each document sequentially to avoid rate limiting
    for (const file of google_docs.files) {
      stats.checked++;
      try {
        console.log(`Processing document: ${file.name} (${file.id})`);
        const existingDoc = await getDocById(file.id!);
        const needsUpdate = !existingDoc ||
          (
            file.modifiedTime &&
            existingDoc.last_updated &&
            new Date(file.modifiedTime) > new Date(existingDoc.last_updated)
          );

        if (needsUpdate) {
          console.log(`Document needs update: ${file.name}`);
          await syncSingleDocument(file);
          existingDoc ? stats.updated++ : stats.created++;
          console.log(`Successfully ${existingDoc ? 'updated' : 'created'} document`);
        } else {
          console.log(`Document up-to-date: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        stats.errors++;
      }
    }

    console.log('Sync completed:', stats);
    return stats;
  } catch (error) {
    console.error('Sync failed:', error);
    throw error;
  }
}



async function syncSingleDocument(document: drive_v3.Schema$File): Promise<void> {
  try {
    const content = await getDocJson(document.id!);
    const docData: CancerDoc = {
      google_doc_id: document.id!,
      title: document.name,
      content: content,
      last_updated: document.modifiedTime,
      slug: generateSlug(document.name!),
    };
    await saveDocsToStorage([docData]);
  } catch (error) {
    console.error(`Failed to sync document ${document.name}:`, error);
    throw error;
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50);
}

