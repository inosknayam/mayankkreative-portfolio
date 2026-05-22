import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "./lib/auth";
import { PermissionLevel } from "./lib/rbac";

const PUBLIC_PATHS = ["/", "/verify-otp", "/api/auth/send-otp", "/api/auth/verify-otp"];

const ADMIN_PATHS: { path: string; minLevel: number }[] = [
  { path: "/admin/staff",    minLevel: PermissionLevel.BRANCH_MANAGER },
  { path: "/admin/roles",    minLevel: PermissionLevel.BRANCH_MANAGER },
  { path: "/admin/children", minLevel: PermissionLevel.EVENT_LEAD },
  { path: "/admin/events",   minLevel: PermissionLevel.EVENT_LEAD },
  { path: "/api/staff",      minLevel: PermissionLevel.BRANCH_MANAGER },
  { path: "/api/roles",      minLevel: PermissionLevel.BRANCH_MANAGER },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // Skip static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  const session = await verifySession(token);
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.set(SESSION_COOKIE, "", { maxAge: 0 });
    return res;
  }

  // RBAC check for admin routes
  for (const rule of ADMIN_PATHS) {
    if (pathname.startsWith(rule.path) && session.permission_level < rule.minLevel) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
