import { NextResponse } from 'next/server';
import { getAllDocs } from '@/lib/docsRepository';

export async function GET() {
  try {
    const articles = await getAllDocs();
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error in /api/articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
