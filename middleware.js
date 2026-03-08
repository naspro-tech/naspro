import { NextResponse } from "next/server";

export function middleware(req) {

  const token = req.cookies.get("auth");

  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect merchant routes
  if (pathname.startsWith("/portal")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
