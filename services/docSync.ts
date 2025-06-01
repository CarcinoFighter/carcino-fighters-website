// services/docSync.ts
import { google } from 'googleapis';
import { getDocById, saveDocsToStorage } from '@/lib/docsRepository';
import { getDocContent, getGoogleDriveFiles } from '@/lib/googleDrive';

const SYNC_INTERVAL = process.env.SYNC_INTERVAL;

export async function startDocSync() {
  await syncDocuments();
  if (SYNC_INTERVAL) {
    setInterval(syncDocuments, Number(SYNC_INTERVAL));
  }
}

async function syncDocuments() {
  try {
    console.log('Starting document sync...');
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const files = await getGoogleDriveFiles(folderId);

    if (!files.files) return;

    for (const file of files.files) {
      console.log(`Processing file: ${file.name} (ID: ${file.id})`);
      const existingDoc = await getDocById(file.id!);

      const docModifiedTime = new Date(file.modifiedTime!).getTime();
      const dbModifiedTime = existingDoc?.last_updated
        ? new Date(existingDoc.last_updated).getTime()
        : 0;

      if (!existingDoc || docModifiedTime > dbModifiedTime) {
        console.log(`Updating document: ${file.name}`);
        await syncDocument(drive, file.id!);
      }
    }
  } catch (error) {
    console.error('Sync error:', error);
  }
}

async function syncDocument(drive: any, fileId: string) {
  const content = await getDocContent(fileId);
  const file = await drive.files.get({ fileId, fields: 'name,modifiedTime' });
  saveDocsToStorage([
    {
      google_doc_id: fileId,
      title: file.data.name,
      content: content,
      last_updated: file.data.modifiedTime,
      slug: generateSlug(file.data.name),
    }
  ])
  console.log(`Document synced: ${file.data.name}`);
  console.log(`Slug generated: ${generateSlug(file.data.name)}`);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}