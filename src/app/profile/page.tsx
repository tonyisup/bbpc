import { env } from "@/env.mjs";

export default async function ProfilePage() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexProfilePage } = await import("./ConvexProfilePage");
    return <ConvexProfilePage />;
  }

  const { default: SqlProfilePage } = await import("./SqlProfilePage");
  return <SqlProfilePage />;
}
