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
            .select("id, username, name, deleted")
            .eq("id", payload.sub)
            .limit(1)
            .maybeSingle();

        if (error || !user || user.deleted) return null;
        return { id: user.id };
    } catch {
        return null;
    }
}

/* ── GET  /api/blogs/interact?blogId=xxx ─────────────────── */
/* Returns auth status so frontend knows whether to allow liking */

export async function GET() {
    try {
        const session = await getSession();
        return NextResponse.json({
            authenticated: !!session,
            userId: session?.id ?? null,
        });
    } catch {
        return NextResponse.json({ authenticated: false, userId: null });
    }
}

/* ── POST /api/blogs/interact ────────────────────────────── */

type InteractBody = {
    action?: "view" | "like";
    blogId?: string;
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
        const { action, blogId } = body;

        if (!action || !blogId) {
            return NextResponse.json(
                { error: "action and blogId are required" },
                { status: 400 },
            );
        }

        if (action === "view") {
            const { error } = await sb.rpc("increment_blog_views", {
                blog_id: blogId,
            });
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ ok: true });
        }

        if (action === "like") {
            const session = await getSession();
            if (!session) {
                return NextResponse.json(
                    { error: "You must be logged in to like a post" },
                    { status: 401 },
                );
            }

            const { error } = await sb.rpc("increment_blog_likes", {
                blog_id: blogId,
            });
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 400 });
            }
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
