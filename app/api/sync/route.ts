
import { startDocSync } from '@/services/docSync';
import { NextResponse } from 'next/server';
export async function GET() {
  try {
    const result = await startDocSync();
    console.log('Sync completed:', result);
    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Sync failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; // Ensure no caching