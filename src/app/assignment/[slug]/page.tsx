import { env } from "@/env.mjs";

interface AssignmentPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const { slug } = await params;
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexAssignmentPage } = await import("./ConvexAssignmentPage");
    return <ConvexAssignmentPage slug={slug} />;
  }

  const { default: SqlAssignmentPage } = await import("./SqlAssignmentPage");
  return <SqlAssignmentPage slug={slug} />;
}
