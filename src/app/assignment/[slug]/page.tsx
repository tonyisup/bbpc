import { env } from "@/env.mjs";

interface AssignmentPageProps {
  params: {
    slug: string;
  };
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const { ConvexAssignmentPage } = await import("./ConvexAssignmentPage");
    return <ConvexAssignmentPage slug={params.slug} />;
  }

  const { default: SqlAssignmentPage } = await import("./SqlAssignmentPage");
  return <SqlAssignmentPage slug={params.slug} />;
}
