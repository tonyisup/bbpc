import { LatestEpisode } from "@/components/LatestEpisode";
import { Episode } from "@/components/Episode";
import { NextEpisode } from "@/components/NextEpisode";
import { EpisodeSkeleton } from "@/components/EpisodeSkeleton";
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { Suspense } from "react";


export default async function HomePage() {
  const latestEpisode = await db.episode.findFirst({
    where: {
      status: 'Published',
      date: {
        lte: new Date(),
      },
    },
    include: {
      assignments: {
        include: {
          movie: true,
          user: true,
          assignmentReviews: {
            include: {
              review: {
                include: {
                  rating: true,
                },
              },
            },
          },
        },
      },
      extras: {
        include: {
          review: {
            include: {
              movie: true,
              user: true,
              show: true,
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

  const session = await getServerAuthSession();
  let hasWon = false;

  if (session?.user && latestEpisode) {
    const win = await db.gamblingPoints.findFirst({
      where: {
        userId: session.user.id,
        status: 'won',
        assignment: {
          episodeId: latestEpisode.id
        }
      }
    });
    hasWon = !!win;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4">
        <div className="flex flex-wrap items-start justify-center gap-12">
          <Suspense fallback={<EpisodeSkeleton />}>
            {latestEpisode && <LatestEpisode episode={latestEpisode} hasWon={hasWon} />}
          </Suspense>
          <Suspense fallback={<EpisodeSkeleton />}>
            <NextEpisode />
          </Suspense>
        </div>
      </div>
    </main>
  );
} 