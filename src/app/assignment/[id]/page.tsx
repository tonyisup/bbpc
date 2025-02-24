import { db } from "@/server/db";
import { notFound } from "next/navigation";
import type { Movie } from "@prisma/client";

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
    },
  });

  if (!assignment) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Assignment for Episode {assignment.Episode.number}
        </h1>
        
        <div className="w-full max-w-2xl">
          <div className="grid gap-4">
            {assignment.Movie && (
              <div key={assignment.Movie.id} className="rounded-lg bg-white/10 p-4 hover:bg-white/20">
                <h3 className="text-lg font-semibold">{assignment.Movie.title}</h3>
                {assignment.Movie.year && (
                  <p className="text-sm text-gray-400">Released: {assignment.Movie.year}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 