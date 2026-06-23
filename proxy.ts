import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth-edge";

// CORS for the public REST API — allows the Expo app (or any client) to call
// the API from a different origin (e.g. Expo web, ngrok tunnel, emulator).
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function isPublicApi(pathname: string) {
  return pathname.startsWith("/api/v1/") && !pathname.startsWith("/api/v1/admin");
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Handle CORS preflight for public API endpoints
  if (req.method === "OPTIONS" && isPublicApi(pathname)) {
    return new NextResponse(null, { status: 204, headers: CORS });
  }

  const hasCookie = Boolean(req.cookies.get(ADMIN_COOKIE)?.value);
  const isLogin = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/v1/admin");

  if (isAdminApi && !hasCookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && !isLogin && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();

  // Attach CORS headers to every public API response
  if (isPublicApi(pathname)) {
    Object.entries(CORS).forEach(([k, v]) => res.headers.set(k, v));
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/v1/:path*"],
};
