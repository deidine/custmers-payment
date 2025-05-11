import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt, getSessionToken } from "./lib/auth";

async function validateSession(token: string | null): Promise<boolean> {
  if (!token) return false;

  try {
    const sessionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_API_URL}/auth/sessions?token=${token}`
    );
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      return session !== null;
    }
  } catch (error) {
    console.error("Failed to verify session:", error);
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");

  // Get session token from cookies
  const token = getSessionToken() || null;
  const isValidSession = await validateSession(token);
  const { pathname } = request.nextUrl;

  // If user access login page on valid session
  if (pathname.startsWith("/login")) {
    return isValidSession
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (!isValidSession) {
    const redirectTo = encodeURIComponent(request.nextUrl.href);
    return NextResponse.redirect(
      new URL(`/login?redirectTo=${redirectTo}`, request.url)
    );
  }

  let payload;
  try {
    payload = await decrypt(token!);
  } catch (error) {
    console.error("Failed to decrypt token:", error);
    const redirectTo = encodeURIComponent(request.nextUrl.href);
    return NextResponse.redirect(
      new URL(`/login?redirectTo=${redirectTo}`, request.url)
    );
  }

  // Check role for specific pages

  // if (pathname.startsWith("/dashboard")) {
  //   if (payload.role !== "ADMIN" && payload.role !== "MANAGER") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  // }

  // if (pathname.startsWith("/admin")) {
  //   if (payload.role !== "ADMIN") {
  //     return NextResponse.redirect(new URL("/", request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/change-password", "/dashboard/:path*"],
};
