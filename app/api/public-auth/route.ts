import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type AuthBody = {
  action?: "register" | "login" | "update_profile" | "logout";
  username?: string;
  password?: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
};

const COOKIE_NAME = "public_jwt";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const sb = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

function missingConfig() {
  return !supabaseUrl || !supabaseServiceKey || !sb || !jwtSecret;
}

function serializeUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    bio: row.bio,
    avatar_url: row.avatar_url,
  };
}

async function getSession() {
  if (missingConfig()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret!) as jwt.JwtPayload & { sub: string };
    const { data: user, error } = await sb!
      .from("users_public")
      .select("id, username, name, bio, avatar_url, deleted")
      .eq("id", payload.sub)
      .limit(1)
      .maybeSingle();

    if (error || !user || user.deleted) return null;
    return { token, user: serializeUser(user) };
  } catch (e) {
    return null;
  }
}

function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function handleUploadAvatar(req: Request) {
  if (missingConfig()) {
    return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
  }

  const session = await getSession();
  if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "avatar file is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop() || "png";
  const path = `users-public/${session.user.id}/avatar.${ext}`;

  const uploadRes = await sb!
    .storage
    .from("profile-picture")
    .upload(path, buffer, { upsert: true, contentType: file.type || "application/octet-stream" });

  if (uploadRes.error) {
    return NextResponse.json({ error: uploadRes.error.message }, { status: 400 });
  }

  const pub = sb!.storage.from("profile-picture").getPublicUrl(path);
  const avatar_url = pub.data?.publicUrl ?? null;

  await sb!
    .from("users_public")
    .update({ avatar_url, updated_at: new Date().toISOString() })
    .eq("id", session.user.id);

  return NextResponse.json({ avatar_url });
}

export async function GET() {
  try {
    if (missingConfig()) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    const session = await getSession();
    if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

    return NextResponse.json({ authenticated: true, user: session.user }, { headers: { "Cache-Control": "private, max-age=120" } });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      return handleUploadAvatar(req);
    }

    if (missingConfig()) {
      return NextResponse.json({ error: "Supabase credentials not configured" }, { status: 500 });
    }

    const body = (await req.json().catch(() => ({}))) as AuthBody;
    const action = body?.action;

    if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

    if (action === "register") {
      const { username, password, name, bio } = body;
      if (!username || !password) {
        return NextResponse.json({ error: "username and password are required" }, { status: 400 });
      }

      const lowerUsername = username.toLowerCase();
      const { count, error: existingErr } = await sb!
        .from("users_public")
        .select("id", { count: "exact", head: true })
        .eq("username", lowerUsername);

      if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 400 });
      if (count && count > 0) return NextResponse.json({ error: "Username already exists" }, { status: 409 });

      const hashed = await bcrypt.hash(password, 10);
      const { data, error } = await sb!
        .from("users_public")
        .insert({
          username: lowerUsername,
          password: hashed,
          name: name ?? null,
          bio: bio ?? null,
          is_active: true,
        })
        .select("id, username, name, bio, avatar_url")
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({ user: serializeUser(data) }, { status: 201 });
    }

    if (action === "login") {
      const { username, password } = body;
      if (!username || !password) return NextResponse.json({ error: "username and password are required" }, { status: 400 });

      const lowerUsername = username.toLowerCase();
      const { data: userRow, error } = await sb!
        .from("users_public")
        .select("id, username, name, password, bio, avatar_url, deleted")
        .eq("username", lowerUsername)
        .limit(1)
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!userRow || userRow.deleted) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const valid = await bcrypt.compare(password, userRow.password ?? "");
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

      const token = jwt.sign({ sub: userRow.id, username: userRow.username }, jwtSecret!, { expiresIn: "7d" });
      const response = NextResponse.json({
        token,
        user: serializeUser(userRow),
      });

      setAuthCookie(response, token);

      await sb!
        .from("users_public")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", userRow.id);

      return response;
    }

    if (action === "update_profile") {
      const session = await getSession();
      if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const userId = session.user.id;

      const updates: Record<string, unknown> = {};
      if (body.username !== undefined) updates.username = body.username ? body.username.toLowerCase() : null;
      if (body.name !== undefined) updates.name = body.name ?? null;
      if (body.bio !== undefined) updates.bio = body.bio ?? null;
      if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url ?? null;
      if (body.password) updates.password = await bcrypt.hash(body.password, 10);
      updates.updated_at = new Date().toISOString();

      const { data, error } = await sb!
        .from("users_public")
        .update(updates)
        .eq("id", userId)
        .select("id, username, name, bio, avatar_url")
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({ user: serializeUser(data) });
    }

    if (action === "logout") {
      const session = await getSession();
      const userId = session?.user?.id;
      if (userId) {
        await sb!
          .from("users_public")
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq("id", userId);
      }

      const response = NextResponse.json({ ok: true });
      response.cookies.set({ name: COOKIE_NAME, value: "", path: "/", maxAge: 0 });
      return response;
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}