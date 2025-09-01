import { Episode } from "@/components/Episode";
import { NextEpisode } from "@/components/NextEpisode";
import { EpisodeSkeleton } from "@/components/EpisodeSkeleton";
import { db } from "@/server/db";
import { Suspense } from "react";


export default async function HomePage() {
  const latestEpisode = await db.episode.findFirst({
    where: {
      date: {
        lte: new Date(),
      },
    },
    include: {
      assignments: {
        include: {
          Movie: true,
          User: true,
          assignmentReviews: {
            include: {
              Review: {
                include: {
                  Rating: true,
                },
              },
            },
          },
        },
      },
      extras: {
        include: {
          Review: {
            include: {
              Movie: true,
              User: true,
            },
          },
        },
      },
      links: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white">
      
      <div className="container flex flex-col items-center justify-center gap-12 px-4">        
        <div className="flex flex-wrap gap-12 justify-evenly">
          <Suspense fallback={<EpisodeSkeleton />}>
            {latestEpisode && <Episode episode={latestEpisode} />}
          </Suspense>
          {/* <EpisodeSkeleton /> */}
          <Suspense fallback={<EpisodeSkeleton />}>
            <NextEpisode />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 