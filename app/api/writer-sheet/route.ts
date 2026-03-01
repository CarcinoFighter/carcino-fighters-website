import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
    if (!Name || !Email || !Phone || !School || !Grade || !Age || !Time || !Experience || !Criticism) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const WritingString = Array.isArray(Writing) ? Writing.join('\n') : Writing;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_WRITER_ID,
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

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common Google Auth errors
      if (errorMessage.includes('private key')) {
        errorMessage = 'Invalid GOOGLE_PRIVATE_KEY format. Ensure it is copied correctly to .env';
      } else if (errorMessage.includes('client_email')) {
        errorMessage = 'Invalid GOOGLE_CLIENT_EMAIL. Ensure it matches your service account';
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
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
