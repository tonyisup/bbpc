import type { NextRequest } from "next/server";

import { env } from "@/env.mjs";

interface RouteHandlerContext {
  params: Promise<{ nextauth: string[] }>;
}

const handler = async (
  request: NextRequest,
  context: RouteHandlerContext
) => {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const [{ default: NextAuth }, { authOptions }] = await Promise.all([
    import("next-auth"),
    import("@/server/auth"),
  ]);
  return NextAuth(request, context, authOptions);
};

export { handler as GET, handler as POST };
