import "server-only";

import { db } from "@/server/db";

export async function getSqlNextEpisode() {
  return db.episode.findFirst({
    orderBy: {
      number: "desc",
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
                  user: true,
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
  });
}
