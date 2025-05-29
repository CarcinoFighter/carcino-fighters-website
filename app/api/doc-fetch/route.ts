/* eslint-disable @typescript-eslint/no-unused-vars*/ 
import { google } from 'googleapis';
import { LoaderCircle } from 'lucide-react';
import { NextResponse } from 'next/server';

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.split(String.raw`\n`).join('\n'),
    },
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
});

const docs = google.docs(
    {
        auth,
        version: 'v1'
    }
)


export async function GET() {
    try {
        const docId = process.env.TEST_DOC
        if (!docId) {
            return NextResponse.json(
                { success: false, message: 'Missing docId query parameter' },
                { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
            );
        }

        const doc = await docs.documents.get({ documentId: docId });
        console.log(doc.data);
        return NextResponse.json(
            { success: true, data: doc.data },
            { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
        
    } catch (error) {
        console.error('Error fetching data from Google Docs:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, PUT',
            'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        },
    });
}
