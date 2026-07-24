import { env } from "@/env.mjs";

export default async function YearPage() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexYearPageClient } = await import("./ConvexYearPageClient");
    return <ConvexYearPageClient />;
  }

  const { YearPageClient } = await import("./YearPageClient");
  return <YearPageClient />;
}
