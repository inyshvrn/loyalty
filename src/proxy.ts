import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { roleHome } from "@/lib/role-home";

// Edge-safe auth instance: authConfig has no Prisma/Node APIs, so this is
// safe to run in the Edge proxy runtime — it only decodes the session JWT,
// it doesn't need to authenticate credentials.
const { auth } = NextAuth(authConfig);

const customerRoutes = ["/dashboard", "/history"];
const baristaRoutes = ["/scan"];
const adminRoutes = ["/admin"];
const guestOnlyRoutes = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const matches = (prefixes: string[]) =>
    prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (session?.user && matches(guestOnlyRoutes)) {
    return NextResponse.redirect(
      new URL(roleHome[session.user.role], req.nextUrl.origin)
    );
  }

  const isCustomerRoute = matches(customerRoutes);
  const isBaristaRoute = matches(baristaRoutes);
  const isAdminRoute = matches(adminRoutes);

  if (!isCustomerRoute && !isBaristaRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { role } = session.user;
  const allowed =
    (isCustomerRoute && role === "CUSTOMER") ||
    (isBaristaRoute && role === "BARISTA") ||
    (isAdminRoute && role === "ADMIN");

  if (!allowed) {
    return NextResponse.redirect(
      new URL(roleHome[role], req.nextUrl.origin)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/scan/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
