import { NextResponse } from 'next/server';
import { getAvatarUrls } from '@/lib/avatarService';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const ids: string[] = body?.ids ?? [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty ids' }, { status: 400 });
    }

    const map = await getAvatarUrls(ids);
    return NextResponse.json({ map });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
