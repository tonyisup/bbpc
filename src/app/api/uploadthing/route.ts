import type { NextRequest } from "next/server";
import {
  createRouteHandler,
  type FileRouter,
} from "uploadthing/next";

import { env } from "@/env.mjs";

async function routeHandlers() {
  const router: FileRouter =
    env.NEXT_PUBLIC_BBPC_BACKEND === "convex"
      ? (await import("@/server/upload/convexUploadthing"))
          .convexFileRouter
      : (await import("@/server/upload/uploadthing")).ourFileRouter;
  return createRouteHandler({ router });
}

export async function GET(request: NextRequest) {
  return (await routeHandlers()).GET(request);
}

export async function POST(request: NextRequest) {
  return (await routeHandlers()).POST(request);
}
