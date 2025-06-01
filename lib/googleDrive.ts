import { error } from "console";
import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
})

const docs = google.docs({
    version: "v1",
    auth
})

const drive = google.drive({
    version: "v3",
    auth,
});

export async function getGoogleDriveFiles(folderId: string | undefined) {
    const { data: files } = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
        fields: "files(id, name, modifiedTime)",
        orderBy: "name",
    });

    return files;
}

export async function getDocJson(docId: string | undefined) {
    try {
        const doc = await docs.documents.get({ documentId: docId });
        console.log(doc.data);
        return doc.data.body?.content || [];
    } catch (error) {
        console.error('Error fetching data from Google Docs:', error);
        throw new Error(`Failed to fetch document JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getDocContent(docId: string | undefined) {
    const response = await drive.files.export({
        fileId: docId,
        mimeType: "text/html",
    }, {
        responseType: "text",

    });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch document content: ${response.statusText}`);
    }

    return response.data as string;

}