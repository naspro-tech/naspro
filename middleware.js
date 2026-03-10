import { NextResponse } from "next/server";

export function middleware(req) {

  const token = req.cookies.get("auth")?.value;

  const { pathname } = req.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect Merchant Portal Routes
  if (pathname.startsWith("/portal")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();

}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
