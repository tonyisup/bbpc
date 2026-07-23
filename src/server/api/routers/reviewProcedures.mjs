import { TRPCError } from "@trpc/server";

import {
  PredictionRoundError,
  PredictionRoundState,
  getPredictionRoundState,
} from "../../../lib/predictionRound.mjs";

/**
 * @typedef {import("@prisma/client").PrismaClient} PrismaClient
 * @typedef {{ session: { user: { id: string } }, db: Pick<PrismaClient, "assignmentReview" | "guess"> }} GuessReadContext
 * @typedef {{ session: { user: { id: string } }, db: Pick<PrismaClient, "$transaction"> }} GuessWriteContext
 */

/**
 * @param {{ ctx: GuessReadContext, input: { assignmentIds: string[] } }} options
 */
export async function getUsersGuessesForAssignments({ ctx, input }) {
  const assignmentReviews = await ctx.db.assignmentReview.findMany({
    where: {
      assignmentId: { in: input.assignmentIds },
    },
    select: {
      id: true,
      assignmentId: true,
    },
  });

  const guesses = await ctx.db.guess.findMany({
    where: {
      assignmntReviewId: {
        in: assignmentReviews.map((assignmentReview) => assignmentReview.id),
      },
      userId: ctx.session.user.id,
    },
    include: {
      rating: true,
      assignmentReview: {
        include: {
          review: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  /** @type {Record<string, typeof guesses>} */
  const result = {};
  for (const assignmentId of input.assignmentIds) {
    result[assignmentId] = guesses.filter(
      (guess) => guess.assignmentReview.assignmentId === assignmentId
    );
  }
  return result;
}

/**
 * @param {{ ctx: GuessReadContext, input: { assignmentId: string } }} options
 */
export async function getGuessesForAssignmentForUser({ ctx, input }) {
  const assignmentReviews = await ctx.db.assignmentReview.findMany({
    where: {
      assignmentId: input.assignmentId,
    },
    select: {
      id: true,
    },
  });

  return ctx.db.guess.findMany({
    where: {
      assignmntReviewId: {
        in: assignmentReviews.map((assignmentReview) => assignmentReview.id),
      },
      userId: ctx.session.user.id,
    },
    include: {
      rating: true,
      assignmentReview: {
        include: {
          review: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
}

/**
 * @param {{
 *   ctx: GuessWriteContext,
 *   input: { assignmentId: string, hostId: string, ratingId: string }
 * }} options
 */
export async function submitGuess({ ctx, input }) {
  return ctx.db.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({
      where: { id: input.assignmentId },
      select: {
        playable: true,
        episode: { select: { status: true } },
        assignmentReviews: {
          where: { review: { userId: input.hostId } },
          select: { id: true },
        },
      },
    });

    if (!assignment) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: PredictionRoundError.ASSIGNMENT_NOT_FOUND,
      });
    }

    if (
      getPredictionRoundState(
        assignment.episode.status,
        assignment.playable
      ) !== PredictionRoundState.OPEN
    ) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: PredictionRoundError.ROUND_LOCKED,
      });
    }

    if (assignment.assignmentReviews.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: PredictionRoundError.INVALID_HOST,
      });
    }

    const rating = await tx.rating.findUnique({
      where: { id: input.ratingId },
      select: { id: true },
    });
    if (!rating) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: PredictionRoundError.INVALID_RATING,
      });
    }

    return tx.$executeRaw`
      EXEC [SubmitGuess]
        @assignmentId=${input.assignmentId},
        @hostId=${input.hostId},
        @guesserId=${ctx.session.user.id},
        @ratingId=${input.ratingId}`;
  });
}
