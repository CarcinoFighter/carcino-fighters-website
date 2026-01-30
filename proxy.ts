import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "jwt";
const ADMIN_ROOT = "/admin";
const LOGIN_PATH = "/admin/login";

async function hasValidAdminToken(token: string | undefined) {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

    // Check if the user has a @carcino.work email
    const email = payload.email as string | undefined;
    if (!email || !email.endsWith("@carcino.work")) {
      console.warn("admin proxy access denied: domain mismatch", { email });
      return false;
    }

    return true;
  } catch (err) {
    console.warn("admin proxy token check failed", err);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_ROOT)) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const valid = await hasValidAdminToken(token);
  const isLogin = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`);

  if (isLogin && valid) {
    const redirectUrl = new URL(ADMIN_ROOT, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (!isLogin && !valid) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
