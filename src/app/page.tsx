import { Episode } from "@/components/Episode";
import { NextEpisode } from "@/components/NextEpisode";
import { db } from "@/server/db";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#020202] to-[#424242] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">        
        <div className="flex flex-wrap gap-12 justify-evenly">
          {latestEpisode && <Episode episode={latestEpisode} />}
          <NextEpisode />
        </div>
      </div>
    </main>
  );
} 