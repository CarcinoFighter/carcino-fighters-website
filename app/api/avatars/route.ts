import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const ids: string[] = body?.ids ?? [];

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty ids' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Supabase server credentials not configured' }, { status: 500 });
    }

    const sb = createClient(url, serviceKey);

    const picsRes = await sb
      .from('profile_pictures')
      .select('user_id, object_key')
      .in('user_id', ids);

    if (picsRes.error) {
      return NextResponse.json({ error: picsRes.error.message }, { status: 500 });
    }

    const map: Record<string, string | null> = Object.fromEntries(ids.map((id) => [id, null]));

    if (picsRes.data && picsRes.data.length) {
      for (const row of picsRes.data) {
        try {
          const signed = await sb.storage
            .from('profile-picture')
            .createSignedUrl(row.object_key, 60 * 60 * 24 * 7); // 7 days
          if (signed?.data?.signedUrl) {
            map[row.user_id] = signed.data.signedUrl;
          } else {
            const pub = sb.storage.from('profile-picture').getPublicUrl(row.object_key);
            map[row.user_id] = pub?.data?.publicUrl ?? null;
          }
        } catch (e) {
          map[row.user_id] = null;
          console.warn('Error generating signed URL for', row.user_id, e);
        }
      }
    }

    return NextResponse.json({ map });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : typeof e === 'string' ? e : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
