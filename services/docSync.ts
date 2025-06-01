// services/docSync.ts
import { google } from 'googleapis';
import { supabase } from '@/lib/initSupabase';

interface SyncStats {
  checked: number;
  updated: number;
  created: number;
  errors: number;
}

export async function syncAllDocuments(): Promise<SyncStats> {
  const stats: SyncStats = {
    checked: 0,
    updated: 0,
    created: 0,
    errors: 0
  };

  try {
    console.log('Initializing Google Drive API...');
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!folderId) {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID not configured');
    }

    console.log('Fetching documents from Google Drive...');
    const { data: driveFiles } = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
      fields: 'files(id,name,modifiedTime)',
    });

    if (!driveFiles.files?.length) {
      console.warn('No documents found in Google Drive folder');
      return stats;
    }

    console.log(`Found ${driveFiles.files.length} documents to process`);
    
    // Process each document sequentially to avoid rate limiting
    for (const file of driveFiles.files) {
      stats.checked++;
      try {
        console.log(`Processing document: ${file.name} (${file.id})`);
        
        const { data: existingDoc } = await supabase
          .from('cancer_docs')
          .select('last_updated')
          .eq('google_doc_id', file.id!)
          .maybeSingle();

        const needsUpdate = !existingDoc || 
          new Date(file.modifiedTime!) > new Date(existingDoc.last_updated);

        if (needsUpdate) {
          console.log(`Document needs update: ${file.name}`);
          await syncSingleDocument(drive, file.id!);
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

async function syncSingleDocument(drive: any, fileId: string) {
  try {
    // Get document content
    console.log(`Exporting content for document ${fileId}...`);
    const { data: content } = await drive.files.export({
      fileId,
      mimeType: 'text/html',
    });

    // Get document metadata
    console.log(`Fetching metadata for document ${fileId}...`);
    const { data: file } = await drive.files.get({ 
      fileId, 
      fields: 'name,modifiedTime' 
    });

    // Prepare document data
    const docData = {
      google_doc_id: fileId,
      title: file.name,
      content: content.data,
      last_updated: file.modifiedTime,
      slug: generateSlug(file.name),
    };

    console.log(`Upserting document ${fileId} to Supabase...`);
    const { error } = await supabase
      .from('cancer_docs')
      .upsert(docData);

    if (error) {
      throw error;
    }

    console.log(`Successfully synced document: ${file.name}`);
  } catch (error) {
    console.error(`Failed to sync document ${fileId}:`, error);
    throw error;
  }
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .substring(0, 50); // Limit slug length
}

// For backward compatibility (remove after updating all callers)
export async function startDocSync() {
  console.warn('startDocSync is deprecated - use syncAllDocuments instead');
  return syncAllDocuments();
}