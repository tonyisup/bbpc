import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  PredictionRoundError,
  PredictionRoundState,
  getPredictionRoundState,
} from "@/lib/predictionRound.mjs";
import { getPredictionScoring } from "@/server/predictionScoring";

export const reviewRouter = createTRPCRouter({
  getPredictionScoring: protectedProcedure.query(({ ctx }) =>
    getPredictionScoring(ctx.db)
  ),

  addMovie: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        movieId: z.string(),
        episodeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.create({
        data: {
          userId: input.userId,
          movieId: input.movieId,
        },
      });

      await ctx.db.extraReview.create({
        data: {
          reviewId: review.id,
          episodeId: input.episodeId,
        },
      });

      return review;
    }),
  addShow: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        showId: z.string(),
        episodeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.review.create({
        data: {
          userId: input.userId,
          showId: input.showId,
        },
      });

      await ctx.db.extraReview.create({
        data: {
          reviewId: review.id,
          episodeId: input.episodeId,
        },
      });

      return review;
    }),

  submitGamblingPoints: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        points: z.number(),
        gamblingTypeId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new Error("Unauthorized");
      }
      if (!input.gamblingTypeId) {
        const gamblingType = await ctx.db.gamblingType.findFirst({
          where: {
            lookupId: "default",
          },
        });
        if (!gamblingType) {
          throw new Error("Default gambling type not found");
        }
        input.gamblingTypeId = gamblingType.id;
      }
      // Check if user has already submitted gambling points for this assignment
      const existingPoints = await ctx.db.gamblingPoints.findFirst({
        where: {
          userId: ctx.session.user.id,
          assignmentId: input.assignmentId,
        },
      });

      if (existingPoints) {
        // Update existing points
        return ctx.db.gamblingPoints.update({
          where: {
            id: existingPoints.id,
          },
          data: {
            points: input.points,
          },
        });
      } else {
        // Create new gambling points
        return ctx.db.gamblingPoints.create({
          data: {
            userId: ctx.session.user.id,
            assignmentId: input.assignmentId,
            points: input.points,
            gamblingTypeId: input.gamblingTypeId,
          },
        });
      }
    }),

  getUsersGuessesForAssignments: protectedProcedure
    .input(
      z.object({
        assignmentIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
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
            in: assignmentReviews.map((ar) => ar.id),
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

      // Group guesses by assignmentId
      const result: Record<string, typeof guesses> = {};
      for (const a of input.assignmentIds) {
        result[a] = guesses.filter(
          (g) => g.assignmentReview.assignmentId === a
        );
      }
      return result;
    }),

  getUsersGamblingPointsForAssignments: protectedProcedure
    .input(
      z.object({
        assignmentIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.id) {
        throw new Error("User not authenticated");
      }

      const gamblingPoints = await ctx.db.gamblingPoints.findMany({
        where: {
          assignmentId: { in: input.assignmentIds },
          userId: ctx.session.user.id,
        },
        select: {
          points: true,
          assignmentId: true,
          assignment: {
            select: {
              movie: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });

      const result: Record<string, typeof gamblingPoints> = {};
      for (const gp of gamblingPoints) {
        if (!gp.assignmentId) continue;
        if (!result[gp.assignmentId]) result[gp.assignmentId] = [];
        result[gp.assignmentId]!.push(gp);
      }
      return result;
    }),

  getUsersAudioMessagesCountForAssignments: protectedProcedure
    .input(
      z.object({
        assignmentIds: z.array(z.string()),
      })
    )
    .query(async ({ ctx, input }) => {
      const counts = await ctx.db.audioMessage.groupBy({
        by: ["assignmentId"],
        where: {
          userId: ctx.session.user.id,
          assignmentId: { in: input.assignmentIds },
        },
        _count: {
          _all: true,
        },
      });

      const result: Record<string, number> = {};
      for (const c of counts) {
        if (c.assignmentId) {
          result[c.assignmentId] = c._count._all;
        }
      }
      return result;
    }),

  getGamblingPointsForAssignment: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.id) {
        throw new Error("User not authenticated");
      }

      return ctx.db.gamblingPoints.findMany({
        where: {
          assignmentId: input.assignmentId,
          userId: ctx.session.user.id,
        },
        select: {
          points: true,
          assignment: {
            select: {
              movie: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });
    }),

  getCountOfUserAudioMessagesForAssignment: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.audioMessage.count({
        where: {
          userId: ctx.session.user.id,
          assignmentId: input.assignmentId,
        },
      });
    }),

  getUserAudioMessagesForAssignment: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.audioMessage.findMany({
        where: {
          userId: ctx.session.user.id,
          assignmentId: input.assignmentId,
        },
        orderBy: {
          id: "desc",
        },
      });
    }),

  deleteAudioMessage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.audioMessage.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (result.count === 0) {
        throw new Error("Unauthorized or message not found");
      }

      return result;
    }),

  getGuessesForAssignmentForUser: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const assignmentReviews = await ctx.db.assignmentReview.findMany({
        where: {
          assignmentId: input.assignmentId,
        },
        select: {
          id: true,
        },
      });

      const guesses = await ctx.db.guess.findMany({
        where: {
          assignmntReviewId: {
            in: assignmentReviews.map((ar) => ar.id),
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
      return guesses;
    }),

  submitGuess: protectedProcedure
    .input(
      z.object({
        assignmentId: z.string(),
        hostId: z.string(),
        ratingId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),

  updateAudioMessage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        assignmentId: z.string(),
        fileKey: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.audioMessage.update({
        where: {
          id: input.id,
          userId: ctx.session.user.id,
        },
        data: {
          assignmentId: input.assignmentId,
          fileKey: input.fileKey,
        },
      });
    }),
  getRating: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.rating.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
  getRatingByValue: publicProcedure
    .input(z.object({ value: z.number() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.rating.findMany({
        where: {
          value: input.value,
        },
      });
      return results[0];
    }),
  getRatings: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.rating.findMany();
  }),
});
