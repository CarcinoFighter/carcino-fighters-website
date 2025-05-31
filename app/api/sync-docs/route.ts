import { deleteDoc, getAllDocs, saveDocsToStorage } from "@/lib/docsRepository";
import { getGoogleDriveFiles, getDocContent } from "@/lib/googleDrive";

export default async function handler(req: Request, res: Response) {
  const authHeader = req.headers.get('authorization');
  if (req.method !== 'POST' || authHeader !== `Bearer ${process.env.API_SECRET}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const docs = await getGoogleDriveFiles(folderId);
    
    const processedDocs = await Promise.all(docs.map(async doc => {
      if (!doc.id) throw new Error("Document id is missing");
      const content = await getDocContent(doc.id);
      if (typeof content !== "string") throw new Error("Document content is not a string");
      return {
        slug: generateSlug(doc.name ?? ""),
        title: doc.name,
        content: formatContent(content),
        google_doc_id: doc.id,
        last_updated: doc.modifiedTime,
      };
    }));


    // Get current docs to find deletions
    const currentDocs = await getAllDocs();
    const currentDocIds = new Set(docs.map(d => d.id));
    const docsToDelete = currentDocs.filter(doc => !currentDocIds.has(doc.google_doc_id));

    // Delete removed docs
    await Promise.all(docsToDelete.map(doc => deleteDoc(doc.google_doc_id)));

    // Save to database or JSON file
    await saveDocsToStorage(processedDocs);
    
    return new Response(JSON.stringify({ success: true, count: processedDocs.length }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ error: 'Sync failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
    
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatContent(content: string): string {
  // Add any content sanitization or formatting here
  return content;
}