import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";

const handleClerkRequest = clerkMiddleware();

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  if (process.env.NEXT_PUBLIC_BBPC_BACKEND !== "convex") {
    return NextResponse.next();
  }
  if (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === undefined ||
    process.env.CLERK_SECRET_KEY === undefined
  ) {
    throw new Error("Convex mode requires Clerk publishable and secret keys.");
  }
  if (
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname.startsWith("/api/trpc")
  ) {
    return new NextResponse(null, {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
  return handleClerkRequest(request, event);
}

export const config = {
  matcher: [
    {
      source:
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      locale: false,
    },
    { source: "/(api|trpc)(.*)", locale: false },
    { source: "/__clerk/(.*)", locale: false },
  ],
};
