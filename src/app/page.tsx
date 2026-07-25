import { LatestEpisode } from "@/components/LatestEpisode";
import { NextEpisode } from "@/components/NextEpisode";
import { Episode } from "@/components/Episode";
import { EpisodeSkeleton } from "@/components/EpisodeSkeleton";
import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { Suspense } from "react";
import { env } from "@/env.mjs";
import {
  getLatestPublishedEpisode,
  getNextScheduledEpisode,
} from "@/server/convex/episodes";
import { hasSignedInUserWonForEpisode } from "@/server/convex/gambling";
import { getPacificTodayPlainDate } from "@/lib/dates";

async function loadSqlLatestEpisode() {
  return db.episode.findFirst({
    where: {
      status: "Published",
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
      date: "desc",
    },
  });
}

async function loadHomeEpisode() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const [latestEpisode, nextEpisode] = await Promise.all([
      getLatestPublishedEpisode(getPacificTodayPlainDate()),
      getNextScheduledEpisode(),
    ]);
    return {
      latestEpisode,
      nextEpisode,
      hasWon:
        latestEpisode === null
          ? false
          : await hasSignedInUserWonForEpisode(latestEpisode.id),
    };
  }

  const latestEpisode = await loadSqlLatestEpisode();
  const session = await getServerAuthSession();
  let hasWon = false;
  if (session?.user && latestEpisode) {
    const win = await db.gamblingPoints.findFirst({
      where: {
        userId: session.user.id,
        status: "won",
        assignment: {
          episodeId: latestEpisode.id,
        },
      },
    });
    hasWon = !!win;
  }
  return { latestEpisode, nextEpisode: null, hasWon };
}

export default async function HomePage() {
  const { latestEpisode, nextEpisode, hasWon } =
    await loadHomeEpisode();
  return (
    <div className="bbpc-page space-y-12 text-white">
      <section aria-labelledby="latest-episode-heading" className="space-y-4">
        <div>
          <p className="bbpc-kicker">Listen now</p>
          <h1
            id="latest-episode-heading"
            className="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Latest episode
          </h1>
        </div>
        <Suspense fallback={<EpisodeSkeleton />}>
          {latestEpisode && (
            <LatestEpisode episode={latestEpisode} hasWon={hasWon} />
          )}
        </Suspense>
      </section>

      <section aria-labelledby="up-next-heading" className="space-y-4">
        <div>
          <p className="bbpc-kicker">Play this week</p>
          <h2
            id="up-next-heading"
            className="text-3xl font-black tracking-tight sm:text-4xl"
          >
            Up next
          </h2>
        </div>
        <Suspense fallback={<EpisodeSkeleton />}>
          {env.NEXT_PUBLIC_BBPC_BACKEND === "convex" ? (
            nextEpisode && (
              <Episode episode={nextEpisode} allowGuesses />
            )
          ) : (
            <NextEpisode allowGuesses />
          )}
        </Suspense>
      </section>
    </div>
  );
}
