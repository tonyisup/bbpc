import { db } from "@/server/db";
import { env } from "@/env.mjs";
import { isUuid, UUID_PATTERN } from "@/lib/ids";
import {
  getEpisodeByLegacyId,
  getEpisodeBySlug,
} from "@/server/convex/episodes";

export { isUuid, UUID_PATTERN };

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
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const episode =
      (await getEpisodeBySlug(slugOrId)) ??
      (isUuid(slugOrId) ? await getEpisodeByLegacyId(slugOrId) : null);
    return {
      episode,
      shouldRedirect:
        !!episode?.slug && isUuid(slugOrId) && episode.slug !== slugOrId,
    };
  }

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
    shouldRedirect:
      !!episode?.slug && isUuid(slugOrId) && episode.id === slugOrId,
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
    shouldRedirect:
      !!assignment?.slug && isUuid(slugOrId) && assignment.id === slugOrId,
  };
}
