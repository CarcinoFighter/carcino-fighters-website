import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

type AuthBody = {
  action?: "register" | "login" | "update_profile" | "logout";
  username?: string;
  identifier?: string;
  password?: string;
  name?: string;
  bio?: string;
  avatar_url?: string;
  email?: string;
  isEmployee?: boolean;
};

const COOKIE_NAME = "public_jwt";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;

const sb = (supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null) as any;

function missingConfig() {
  return !supabaseUrl || !supabaseServiceKey || !sb || !jwtSecret;
}

async function serializeUser(row: any) {
  if (!row) return null;
  const user = {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.name,
    bio: row.bio,
    avatar_url: row.avatar_url,
    is_employee: false,
    position: null as string | null,
  };

  // Check if this user is an employee
  if (sb && row.email) {
    const { data: employee } = await sb
      .from("users") // Original users table is now Employees
      .select("id, name, position, description")
      .eq("email", row.email.toLowerCase())
      .limit(1)
      .maybeSingle();

    if (employee) {
      user.is_employee = true;
      user.position = employee.position;
      // Prefer employee name and description/bio if available
      if (employee.name) user.name = employee.name;
      if (employee.description) user.bio = employee.description;

      // Fetch employee pfp
      const { data: picData } = await sb
        .from("profile_pictures")
        .select("object_key")
        .eq("user_id", employee.id)
        .maybeSingle();

      if (picData?.object_key) {
        const { data: signed } = await sb.storage
          .from("profile-picture")
          .createSignedUrl(picData.object_key, 60 * 60 * 24 * 7);
        if (signed?.signedUrl) user.avatar_url = signed.signedUrl;
      }
    }
  }

  return user;
}

async function getSession() {
  if (missingConfig()) return null;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, jwtSecret!) as jwt.JwtPayload & { sub: string };
    const { data: user, error } = await sb!
      .from("users_public")
      .select("id, username, email, name, bio, avatar_url, deleted")
      .eq("id", payload.sub)
      .limit(1)
      .maybeSingle();

    if (error || !user || user.deleted) return null;
    return { token, user: await serializeUser(user) };
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
      const { username, email, password, name, bio } = body;
      if (!username || !email || !password) {
        return NextResponse.json({ error: "username, email and password are required" }, { status: 400 });
      }

      const lowerUsername = username.toLowerCase();
      const lowerEmail = email.toLowerCase();
      const { count, error: existingErr } = await sb!
        .from("users_public")
        .select("id", { count: "exact", head: true })
        .or(`username.eq.${lowerUsername},email.eq.${lowerEmail}`);

      if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 400 });
      if (count && count > 0) return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });

      const hashed = await bcrypt.hash(password, 10);
      const { data, error } = await sb!
        .from("users_public")
        .insert({
          username: lowerUsername,
          email: lowerEmail,
          password: hashed,
          name: name ?? null,
          bio: bio ?? null,
          is_active: true,
        })
        .select("id, username, email, name, bio, avatar_url")
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      const user = await serializeUser(data);
      if (!user) return NextResponse.json({ error: "Failed to create user" }, { status: 500 });

      const token = jwt.sign({ sub: user.id, username: user.username }, jwtSecret!, { expiresIn: "7d" });
      const response = NextResponse.json({ user }, { status: 201 });
      setAuthCookie(response, token);

      return response;
    }

    if (action === "login") {
      const { isEmployee } = body;
      const identifier = body.identifier ?? body.username;
      const { password } = body;
      if (!identifier || !password) return NextResponse.json({ error: "identifier and password are required" }, { status: 400 });

      const lowerIdentifier = identifier.toLowerCase();
      let userRow: any = null;

      if (isEmployee) {
        // Authenticate as employee first
        const { data: emp, error: empErr } = await sb!
          .from("users")
          .select("id, username, email, name, password, description, avatar_url")
          .or(`username.eq.${lowerIdentifier},email.eq.${lowerIdentifier}`)
          .limit(1)
          .maybeSingle();

        if (empErr) return NextResponse.json({ error: empErr.message }, { status: 400 });
        if (!emp) return NextResponse.json({ error: "Invalid employee credentials" }, { status: 401 });

        const valid = await bcrypt.compare(password, emp.password ?? "");
        if (!valid) return NextResponse.json({ error: "Invalid employee credentials" }, { status: 401 });

        // Ensure they have a public profile
        const { data: existingPub } = await sb!
          .from("users_public")
          .select("id, username, email, name, password, bio, avatar_url, deleted")
          .eq("email", emp.email.toLowerCase())
          .limit(1)
          .maybeSingle();

        if (existingPub) {
          if (existingPub.deleted) {
            // Restore deleted public profile if employee logs in
            await sb!.from("users_public").update({ deleted: false, updated_at: new Date().toISOString() }).eq("id", existingPub.id);
            existingPub.deleted = false;
          }
          userRow = existingPub;
        } else {
          // Sync employee to public table
          const { data: newPub, error: syncErr } = await sb!
            .from("users_public")
            .insert({
              username: emp.username?.toLowerCase() || emp.email.split("@")[0].toLowerCase(),
              email: emp.email.toLowerCase(),
              password: emp.password, // already hashed
              name: emp.name,
              bio: emp.description,
              is_active: true,
            })
            .select("id, username, email, name, password, bio, avatar_url, deleted")
            .maybeSingle();

          if (syncErr) return NextResponse.json({ error: `Sync Failed: ${syncErr.message}` }, { status: 500 });
          userRow = newPub;
        }
      } else {
        // Standard public login
        const { data, error } = await sb!
          .from("users_public")
          .select("id, username, email, name, password, bio, avatar_url, deleted")
          .or(`username.eq.${lowerIdentifier},email.eq.${lowerIdentifier}`)
          .limit(1)
          .maybeSingle();

        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        if (!data || data.deleted) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

        const valid = await bcrypt.compare(password, data.password ?? "");
        if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        userRow = data;
      }

      const token = jwt.sign({ sub: userRow.id, username: userRow.username }, jwtSecret!, { expiresIn: "7d" });
      const response = NextResponse.json({
        token,
        user: await serializeUser(userRow),
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
      if (body.email !== undefined) updates.email = body.email ? body.email.toLowerCase() : null;
      if (body.name !== undefined) updates.name = body.name ?? null;
      if (body.bio !== undefined) updates.bio = body.bio ?? null;
      if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url ?? null;
      if (body.password) updates.password = await bcrypt.hash(body.password, 10);
      updates.updated_at = new Date().toISOString();

      if (updates.username || updates.email) {
        const { count, error: existingErr } = await sb!
          .from("users_public")
          .select("id", { count: "exact", head: true })
          .or(`username.eq.${updates.username || ""},email.eq.${updates.email || ""}`)
          .neq("id", userId);

        if (existingErr) return NextResponse.json({ error: existingErr.message }, { status: 400 });
        if (count && count > 0) return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
      }

      const { data, error } = await sb!
        .from("users_public")
        .update(updates)
        .eq("id", userId)
        .select("id, username, email, name, bio, avatar_url")
        .maybeSingle();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({ user: await serializeUser(data) });
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