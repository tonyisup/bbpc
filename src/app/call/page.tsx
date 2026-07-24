import { env } from "@/env.mjs";

export default async function CallPage() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexCallPage } = await import("./ConvexCallPage");
    return <ConvexCallPage />;
  }

  const { default: SqlCallPage } = await import("./SqlCallPage");
  return <SqlCallPage />;
}
