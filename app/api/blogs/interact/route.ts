import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "public_jwt";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const sb =
    supabaseUrl && supabaseServiceKey
        ? createClient(supabaseUrl, supabaseServiceKey)
        : null;

async function getSession() {
    if (!sb || !jwtSecret) return null;
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;

    try {
        const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload & { sub: string };
        const { data: user, error } = await sb
            .from("users_public")
            .select("id, username, name, deleted, is_banned")
            .eq("id", payload.sub)
            .limit(1)
            .maybeSingle();

        if (error || !user || user.deleted) return null;
        return { id: user.id, isBanned: !!user.is_banned };
    } catch {
        return null;
    }
}

/* ── GET  /api/blogs/interact?blogId=xxx ─────────────────── */
/* Returns auth status so frontend knows whether to allow liking */

export async function GET(req: Request) {
    try {
        const session = (await getSession()) as { id: string; isBanned: boolean } | null;
        const url = new URL(req.url);
        const blogId = url.searchParams.get("blogId");
        const source = url.searchParams.get("source") || "community";
        const content_type = url.searchParams.get("content_type") || "blog";
        let liked = false;

        if (session && blogId && sb) {
            const { data } = await sb
                .from("blog_bookmarks")
                .select("blog_id")
                .eq("user_id", session.id)
                .eq("blog_id", blogId)
                .eq("source", source)
                .eq("content_type", content_type)
                .maybeSingle();
            if (data) liked = true;
        }

        return NextResponse.json({
            authenticated: !!session,
            userId: session?.id ?? null,
            isBanned: session?.isBanned ?? false,
            liked
        });
    } catch {
        return NextResponse.json({ authenticated: false, userId: null, isBanned: false, liked: false });
    }
}

/* ── POST /api/blogs/interact ────────────────────────────── */

type InteractBody = {
    action?: "view" | "like";
    blogId?: string;
    source?: "community" | "staff";
    content_type?: "blog" | "survivor_story" | "cancer_doc";
};

export async function POST(req: Request) {
    try {
        if (!sb) {
            return NextResponse.json(
                { error: "Supabase credentials not configured" },
                { status: 500 },
            );
        }

        const body = (await req.json().catch(() => ({}))) as InteractBody;
        const { action, blogId, source, content_type } = body;

        if (!action || !blogId) {
            return NextResponse.json(
                { error: "action and blogId are required" },
                { status: 400 },
            );
        }

        if (action === "view") {
            if (source === 'community') {
                let rpcName = "";
                if (content_type === 'blog') rpcName = "increment_blog_views";
                else if (content_type === 'survivor_story') rpcName = "increment_story_views";
                
                if (rpcName) {
                    await sb.rpc(rpcName, {
                        blog_id: blogId,
                        story_id: blogId
                    });
                }
            }
            return NextResponse.json({ ok: true });
        }

        if (action === "like") {
            const session = (await getSession()) as { id: string; isBanned: boolean } | null;
            if (!session) {
                return NextResponse.json(
                    { error: "You must be logged in to like a post" },
                    { status: 401 },
                );
            }

            if (session.isBanned) {
                return NextResponse.json(
                    { error: "Banned users cannot like or bookmark posts." },
                    { status: 403 },
                );
            }

            const { error: bookmarkErr } = await sb
                .from("blog_bookmarks")
                .insert({ 
                    user_id: session.id, 
                    blog_id: blogId,
                    source: source || 'community',
                    content_type: content_type || 'blog'
                });

            if (bookmarkErr) {
                if (bookmarkErr.code !== '23505') {
                    return NextResponse.json({ error: bookmarkErr.message }, { status: 400 });
                }
            } else if (source === 'community') {
                // Only increment likes for community content in our DB
                let rpcName = "";
                if (content_type === 'blog') rpcName = "increment_blog_likes";
                else if (content_type === 'survivor_story') rpcName = "increment_story_likes";
                
                if (rpcName) {
                    const { error } = await sb.rpc(rpcName, {
                        blog_id: blogId,
                        story_id: blogId // Some RPCs might use story_id
                    });
                    // Silently fail RPC if it doesn't exist, bookmark is still saved
                }
            }
            
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
