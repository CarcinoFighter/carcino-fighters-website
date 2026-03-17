import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const name = searchParams.get("name") || "Test User";

  if (!email) {
    return NextResponse.json({ error: "Email is required. Use ?email=your@email.com" }, { status: 400 });
  }

  try {
    const result = await sendWelcomeEmail(email, name);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
