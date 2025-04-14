import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({
  auth,
  version: 'v4',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Name, Email, Phone, School, Grade, Age, Time, Experience, Criticism, Writing } = body;

    // Validate required fields
    if (!Name || !Email || !Phone || !School || !Grade || !Age || !Time || !Experience || !Criticism || !Writing) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const WritingString = Array.isArray(Writing) ? Writing.join('\n') : Writing;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [Name, Email, Phone, School, Grade, Age, Time, Experience, Criticism, WritingString],
        ],
      },
    });

    return NextResponse.json(
      { success: true, data: response.data },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Error writing data to Google Sheets:', error);
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