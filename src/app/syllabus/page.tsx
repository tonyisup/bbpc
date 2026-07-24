import { env } from "@/env.mjs";

export default async function SyllabusPage() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexSyllabusPage } = await import("./ConvexSyllabusPage");
    return <ConvexSyllabusPage />;
  }

  const { default: SqlSyllabusPage } = await import("./SqlSyllabusPage");
  return <SqlSyllabusPage />;
}
