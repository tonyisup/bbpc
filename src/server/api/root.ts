import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { createTRPCRouter, protectedProcedure, adminProcedure, publicProcedure } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  episode: createTRPCRouter({
    next: publicProcedure.query(async ({ ctx }) => {
      return ctx.db.episode.findFirst({
        orderBy: {
          number: 'desc',
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
      });
    }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ ctx, input }) => {
        if (!input.query.trim()) {
          return [];
        }
        return ctx.db.episode.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: input.query,
                },
              },
              {
                assignments: {
                  some: {
                    Movie: {
                      title: {
                        contains: input.query,
                      },
                    },
                  },
                },
              },
            ],
          },
          include: {
            assignments: {
              include: {
                Movie: true,
                User: true,
              },
            },
            extras: {
              include: {
                Review: {
                  include: {
                    User: true,
                    Movie: true,
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
      }),
    history: publicProcedure.query(async ({ ctx }) => {
      return ctx.db.episode.findMany({
        orderBy: {
          date: 'desc',
        },
        include: {
          assignments: {
            include: {
              Movie: true,
              User: true,
            },
          },
          extras: {
            include: {
              Review: {
                include: {
                  User: true,
                  Movie: true,
                },
              },
            },
          },
          links: true,
        },
      });
    }),
  }),

  game: createTRPCRouter({
    points: protectedProcedure.query(async ({ ctx }) => {
      return ctx.db.user.findMany({
        orderBy: {
          points: 'desc',
        },
      });
    }),
    
    addPointsToUser: adminProcedure
      .input(z.object({
        userId: z.string(),
        points: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await ctx.db.user.findUnique({
          where: { id: input.userId },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const currentPoints = user.points || new Decimal(0);
        const newPoints = currentPoints.add(new Decimal(input.points));

        return ctx.db.user.update({
          where: { id: input.userId },
          data: {
            points: newPoints,
          },
        });
      }),
  }),

  auth: createTRPCRouter({
    isAdmin: protectedProcedure.query(async ({ ctx }) => {
      const userRoles = await ctx.db.userRole.findMany({
        where: { userId: ctx.session.user.id },
        include: { role: true },
      });
      return userRoles.some(ur => ur.role.admin);
    }),
  }),

  user: createTRPCRouter({
    me: protectedProcedure.query(({ ctx }) => {
      return ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
    }),
    update: protectedProcedure
      .input(z.object({
        name: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        return ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: { name: input.name },
        });
      }),
  }),

  movie: createTRPCRouter({
    search: protectedProcedure
      .input(z.object({
        term: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return ctx.db.movie.findMany({
          where: {
            title: {
              startsWith: input.term,
            },
          },
          orderBy: {
            title: 'asc',
          },
          take: 10,
        });
      }),
  }),

  review: createTRPCRouter({
    add: protectedProcedure
      .input(z.object({
        userId: z.string(),
        movieId: z.string(),
        episodeId: z.string(),
      }))
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
  }),
});

export type AppRouter = typeof appRouter; 