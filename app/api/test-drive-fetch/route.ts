import {NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {

    try {
        const auth = new google.auth.GoogleAuth(
            {
                credentials: {
                    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
                },
                scopes: ["https://www.googleapis.com/auth/drive.readonly"],
            }
        )
        const drive = google.drive({
            version: "v3",
            auth,
        });
        const about = await drive.about.get({
            fields: "user, storageQuota"
        })
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            return new NextResponse(JSON.stringify({ error: 'Missing GOOGLE_DRIVE_FOLDER_ID environment variable' }), { status: 400 });
        }

        const files = await drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document'`,
            fields: "files(id, name, webViewLink, modifiedTime)",
            pageSize: 3,
        })

        let sampleContent = null;
        if (files.data.files && files.data.files.length > 0) {
            const sampleDoc = files.data.files[0];
            let content = null
            if (sampleDoc && sampleDoc.id) {
                content = await drive.files.export({
                    fileId: sampleDoc.id,
                    mimeType: "text/plain",
                });
            }

            sampleContent = {
                id: sampleDoc.id,
                name: sampleDoc.name,
                content: content && typeof content.data === "string"
                    ? content.data.substring(0, 200) + "..."
                    : content && Buffer.isBuffer(content.data)
                        ? content.data.toString().substring(0, 200) + "..."
                        : null,
            }
        }

        return new NextResponse(JSON.stringify({
            success: true,
            user: about.data.user,
            storageQuota: about.data.storageQuota,
            files: files.data.files,
            sampleContent,
        }), {
            status: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
        });
    }
    catch (error) {
        console.error('Error initializing Google Auth:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}