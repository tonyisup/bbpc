import { notFound, permanentRedirect } from "next/navigation";
import Assignment from "@/components/Assignment";
import GameSegment from "@/components/GameSegment";
import { getAssignmentPath } from "@/lib/routes";
import { resolveAssignmentRouteParam } from "@/server/slugs";

interface AssignmentPageProps {
  params: {
    slug: string;
  };
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const { assignment, shouldRedirect } = await resolveAssignmentRouteParam(params.slug);

  if (shouldRedirect && assignment?.slug) {
    permanentRedirect(getAssignmentPath(assignment.slug));
  }

  if (!assignment) {
    notFound();
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {assignment && <Assignment assignment={assignment} />}
      <GameSegment assignment={assignment} />
    </div>
  );
}
