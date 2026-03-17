import { db } from "@/server/db";

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

const episodeInclude = {
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
          guesses: {
            include: {
              user: true,
              rating: true,
            },
          },
        },
      },
      gamblingPoints: {
        include: {
          user: true,
          gamblingType: true,
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
} as const;

const assignmentInclude = {
  movie: true,
  episode: true,
  user: true,
} as const;

export async function resolveEpisodeRouteParam(slugOrId: string) {
  const episode =
    (await db.episode.findUnique({
      where: { slug: slugOrId },
      include: episodeInclude,
    })) ??
    (isUuid(slugOrId)
      ? await db.episode.findUnique({
          where: { id: slugOrId },
          include: episodeInclude,
        })
      : null);

  return {
    episode,
    shouldRedirect: !!episode?.slug && isUuid(slugOrId) && episode.id === slugOrId,
  };
}

export async function resolveAssignmentRouteParam(slugOrId: string) {
  const assignment =
    (await db.assignment.findUnique({
      where: { slug: slugOrId },
      include: assignmentInclude,
    })) ??
    (isUuid(slugOrId)
      ? await db.assignment.findUnique({
          where: { id: slugOrId },
          include: assignmentInclude,
        })
      : null);

  return {
    assignment,
    shouldRedirect: !!assignment?.slug && isUuid(slugOrId) && assignment.id === slugOrId,
  };
}
