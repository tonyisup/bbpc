import type { NextRequest } from "next/server";

import { env } from "@/env.mjs";

const handler = async (req: NextRequest) => {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const [{ fetchRequestHandler }, { appRouter }, { createTRPCContext }] =
    await Promise.all([
      import("@trpc/server/adapters/fetch"),
      import("@/server/api/root"),
      import("@/server/api/trpc"),
    ]);

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
            );
          }
        : undefined,
  });
};

export { handler as GET, handler as POST };
