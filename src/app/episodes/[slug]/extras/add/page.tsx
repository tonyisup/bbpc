import { env } from "@/env.mjs";

interface AddExtraPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AddExtraPage({ params }: AddExtraPageProps) {
  const { slug } = await params;
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexAddExtraPage } = await import("./ConvexAddExtraPage");
    return <ConvexAddExtraPage slug={slug} />;
  }

  const { default: SqlAddExtraPage } = await import("./SqlAddExtraPage");
  return <SqlAddExtraPage slug={slug} />;
}
