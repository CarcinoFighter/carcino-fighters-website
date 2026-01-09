import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type ReqBody = {
  action: "register" | "login" | "upsert";
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  avatar_url?: string;
  identifier?: string; // for login
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!;
const jwtSecret = process.env.JWT_SECRET!;
const COOKIE_NAME = "jwt";

const sb = createClient(supabaseUrl, supabaseServiceKey);

async function createSessionRow(userId: string, token: string, expiresAt: string | null, req: Request) {
  // Option: store token_hash instead of raw token. Here we store token and token_hash for example.
  const crypto = await import("node:crypto");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const userAgent = req.headers.get("user-agent") ?? null;
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

  const { error } = await sb
    .from("login_sessions")
    .insert({
      user_id: userId,
      token,
      token_hash: tokenHash,
      user_agent: userAgent,
      ip_address: ip,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    });

  if (error) throw error;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const action = body?.action;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    if (!jwtSecret) {
      return NextResponse.json({ error: "JWT secret not configured" }, { status: 500 });
    }

    if (action === "register") {
      const { username, email, password, name, avatar_url } = body;
      if (!email || !password) {
        return NextResponse.json({ error: "email and password are required" }, { status: 400 });
      }

      const hashed = await bcrypt.hash(password, 10);

      // Use insert; you can also use upsert if you want to update on conflict
      const { data, error } = await sb
        .from("users")
        .insert({
          username: username ?? null,
          email: email.toLowerCase(),
          password: hashed,
          name: name ?? null,
          avatar_url: avatar_url ?? null,
        })
        .select("id, username, email, name")
        .maybeSingle();

      if (error) {
        // handle unique violation etc.
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ user: data }, { status: 201 });
    }

    if (action === "login") {
      const identifier = body.identifier ?? body.username ?? body.email;
      const password = body.password;
      if (!identifier || !password) {
        return NextResponse.json({ error: "identifier and password required" }, { status: 400 });
      }

      // find user by username or email (case-insensitive)
      const { data: user, error } = await sb
        .from("users")
        .select("id, username, email, name, password")
        .or(`username.eq.${identifier},email.eq.${identifier}`)
        .limit(1)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const valid = await bcrypt.compare(password, user.password ?? "");
      if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // sign JWT
      const token = jwt.sign(
        {
          sub: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        jwtSecret,
        { expiresIn: "7d" }
      );

      // create session row in DB
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await createSessionRow(user.id, token, expiresAt, req);

      // set cookie
      const response = NextResponse.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, name: user.name },
      });
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (action === "upsert") {
      // Upsert profile fields only. Do not send created_at/updated_at.
      const { username, email, name, avatar_url } = body;
      if (!email) return NextResponse.json({ error: "email is required for upsert" }, { status: 400 });

      // Upsert on email (example): conflict target = email
      const { data, error } = await sb
        .from("users")
        .upsert(
          {
            email: email.toLowerCase(),
            username: username ?? null,
            name: name ?? null,
            avatar_url: avatar_url ?? null,
          },
          { onConflict: "email" }
        )
        .select("id, username, email, name, avatar_url")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ user: data }, { status: 200 });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}