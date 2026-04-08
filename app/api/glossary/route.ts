import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const jwtSecret = process.env.JWT_SECRET;
const sb = (supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null) as any;

function missingConfig() {
  return !supabaseUrl || !supabaseServiceKey || !sb || !jwtSecret;
}

// Basic auth check for admin panel
async function getSession() {
  if (missingConfig() || !jwtSecret) return null;
  const cookieStore = await cookies();
  let token = cookieStore.get("jwt")?.value;
  if (!token) token = cookieStore.get("public_jwt")?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, jwtSecret) as jwt.JwtPayload & { sub: string };
    
    // Check if employee
    const { data: empUser } = await sb!
      .from("users")
      .select("id, email, admin_access")
      .eq("id", payload.sub)
      .limit(1)
      .maybeSingle();

    if (empUser) return { admin_access: Boolean(empUser.admin_access) };

    // Fallback: check by email if sub is from users_public
    const { data: pubUser } = await sb!.from("users_public").select("email").eq("id", payload.sub).maybeSingle();
    if (pubUser) {
      const { data: empByEmail } = await sb!.from("users").select("admin_access").eq("email", pubUser.email.toLowerCase()).maybeSingle();
      if (empByEmail) return { admin_access: Boolean(empByEmail.admin_access) };
    }
    
    return null;
  } catch (e) {
    console.error("Auth error in glossary API:", e);
    return null;
  }
}

export async function GET(req: Request) {
  if (missingConfig()) return NextResponse.json({ error: "Missing config" }, { status: 500 });
  const { data, error } = await sb!.from("glossary").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("Glossary GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ glossary: data || [] });
}

export async function POST(req: Request) {
  if (missingConfig()) return NextResponse.json({ error: "Missing config" }, { status: 500 });
  const session = await getSession();
  if (!session?.admin_access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { word, meaning } = body;
  console.log("Adding glossary word:", { word, meaning });
  
  if (!word || !meaning) return NextResponse.json({ error: "Word and meaning are required" }, { status: 400 });

  const { data, error } = await sb!
    .from("glossary")
    .insert({ word, meaning })
    .select()
    .single();

  if (error) {
    console.error("Glossary POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ item: data });
}

export async function PUT(req: Request) {
  if (missingConfig()) return NextResponse.json({ error: "Missing config" }, { status: 500 });
  const session = await getSession();
  if (!session?.admin_access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, word, meaning } = body;
  if (!id || !word || !meaning) return NextResponse.json({ error: "id, word, and meaning are required" }, { status: 400 });

  const { data, error } = await sb!
    .from("glossary")
    .update({ word, meaning })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request) {
  if (missingConfig()) return NextResponse.json({ error: "Missing config" }, { status: 500 });
  const session = await getSession();
  if (!session?.admin_access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { error } = await sb!.from("glossary").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
