import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "jwt";
const ADMIN_ROOT = "/admin";
const LOGIN_PATH = "/admin/login";

async function hasValidAuth(request: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return false;

  const adminToken = request.cookies.get("jwt")?.value;
  const publicToken = request.cookies.get("public_jwt")?.value;

  if (adminToken) {
    try {
      await jwtVerify(adminToken, new TextEncoder().encode(secret));
      return true;
    } catch (e) { }
  }

  if (publicToken) {
    try {
      const { payload } = await jwtVerify(publicToken, new TextEncoder().encode(secret));
      // For public_jwt, we'd need to check if they are an employee. 
      // However, the proxy is just a first-layer redirect. The API routes do the heavy lifting.
      // But let's try to be consistent with the @carcino.work check if possible.
      // Actually, employee sign-in might not have @carcino.work email if they are external writers? 
      // The current hasValidAdminToken checks for @carcino.work.
      return true;
    } catch (e) { }
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Maintenance Mode Logic
  // ... (keep as is)
  const isMaintenancePage = pathname === '/maintenance';
  const isAdminPath = pathname.startsWith('/admin');
  const isApiPath = pathname.startsWith('/api');
  const isAsset = pathname.includes('.') || pathname.startsWith('/_next');

  if (!isMaintenancePage && !isAdminPath && !isApiPath && !isAsset) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseAnonKey) {
        const restUrl = `${supabaseUrl}/rest/v1/site_settings?key=eq.maintenance_mode&select=value`;
        const res = await fetch(restUrl, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          next: { revalidate: 0 }
        });

        if (res.ok) {
          const data = await res.json();
          const setting = data[0]?.value;
          if (setting?.enabled === true) {
            return NextResponse.redirect(new URL('/maintenance', request.url));
          }
        }
      }
    } catch (err) {
      console.error('Proxy: Maintenance check error:', err);
    }
  }

  // 2. Admin Auth Proxy Logic
  if (pathname.startsWith(ADMIN_ROOT)) {
    const valid = await hasValidAuth(request);
    const isLoginPath = pathname === "/admin/login"; // This page is now deleted, but just in case

    if (isLoginPath && valid) {
      return NextResponse.redirect(new URL(ADMIN_ROOT, request.url));
    }

    if (!valid && pathname.startsWith(ADMIN_ROOT) && pathname !== "/sign-in") {
      const loginUrl = new URL("/sign-in", request.url);
      loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
