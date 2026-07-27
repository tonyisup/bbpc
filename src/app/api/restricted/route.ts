import { NextResponse } from "next/server";

import { env } from "@/env.mjs";

export async function GET() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const { getServerAuthSession } = await import("@/server/auth");
  const session = await getServerAuthSession();

  if (session) {
    return NextResponse.json({
      content:
        "This is protected content. You can access this content because you are signed in.",
    });
  }

  return NextResponse.json(
    {
      error: "You must be signed in to view the protected content on this page.",
    },
    { status: 401 }
  );
}
