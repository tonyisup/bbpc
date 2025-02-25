import { db } from "@/server/db";
import { notFound } from "next/navigation";
import type { Movie } from "@prisma/client";
import Assignment from "@/components/Assignment";
import GameSegment from "@/components/GameSegment";

interface AssignmentPageProps {
  params: {
    id: string;
  };
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
  const assignment = await db.assignment.findUnique({
    where: { id: params.id },
    include: {
      Movie: true,
      Episode: true,
      User: true,
    },
  });

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