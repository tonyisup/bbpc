import { Episode } from "@/components/Episode";
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
              Rating: true,
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

  const nextEpisode = await db.episode.findFirst({
    orderBy: {
      number: "desc"
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
              Rating: true,
              User: true,
            },
          },
        },
      },
      links: true,
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#020202] to-[#424242] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">        
        <div className="flex flex-wrap gap-12 justify-evenly">
          {latestEpisode && <Episode episode={latestEpisode} />}
          {nextEpisode && <Episode episode={nextEpisode} allowGuesses={true} />}
        </div>
      </div>
    </main>
  );
} 