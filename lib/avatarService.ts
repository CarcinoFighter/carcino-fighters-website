import { createClient } from '@supabase/supabase-js';

export async function getAvatarUrls(ids: string[]): Promise<Record<string, string | null>> {
    if (!Array.isArray(ids) || ids.length === 0) {
        return {};
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Use service role key if available (server-side), otherwise public key
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;

    if (!url || !serviceKey) {
        console.error('Supabase credentials missing in getAvatarUrls');
        return {};
    }

    const sb = createClient(url, serviceKey);

    try {
        const picsRes = await sb
            .from('profile_pictures')
            .select('user_id, object_key')
            .in('user_id', ids);

        if (picsRes.error) {
            console.error('Error fetching profile pictures:', picsRes.error);
            return {};
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

        return map;
    } catch (e) {
        console.error('Unexpected error in getAvatarUrls:', e);
        return {};
    }
}
