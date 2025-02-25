import { z } from "zod";
import { Decimal } from "@prisma/client/runtime/library";
import { type Rating } from "@prisma/client";
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
    
    addPointsToUser: protectedProcedure
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
    getSession: publicProcedure.query(({ ctx }) => {
      return ctx.session;
    }),
    isAdmin: protectedProcedure.query(async ({ ctx }) => {
      const userRoles = await ctx.db.userRole.findMany({
        where: { userId: ctx.session.user.id },
        include: { role: true },
      });
      return userRoles.some(ur => ur.role.admin);
    }),
    getPhoneNumber: publicProcedure.query(async () => {
      const phoneNumber = process.env.PHONE_NUMBER;
      if (!phoneNumber) {
        return null;
      }
      return phoneNumber;
    }),
    getSecretMessage: protectedProcedure
      .query(() => {
        return "you can now see this secret message!";
      }),
    verifyRecaptcha: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${input.token}`;

        const response = await fetch(verificationUrl, { method: 'POST' });
        const data = await response.json();

        return { success: data.success };
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
    hosts: publicProcedure.query(async ({ ctx }) => {
      return ctx.db.user.findMany({
        where: {
          roles: {
            some: { 
              role: {
                admin: true
              }
            }
          }
        }
      }); 
    }),
    myRoles: protectedProcedure
      .query(async ({ ctx }) => 
        await ctx.db.userRole.findMany({
          where: { userId: ctx.session.user.id },
        }))
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
    assignment: publicProcedure
      .input(z.object({
        id: z.string()
      }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.assignment.findUnique({
          where: {
            id: input.id
          },
        });
      }),
    assignmentRatings: publicProcedure
      .input(z.object({
        assignmentId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.$queryRaw<Rating[]>`select * from [dbo].[AssignmentRatings] where [assignmentId] = ${input.assignmentId}`;
      }),
    ratings: publicProcedure
      .query(async ({ ctx }) => {
        return await ctx.db.rating.findMany({
          orderBy: {
            value: 'asc'
          }
        });
      }),
    find: publicProcedure
      .input(z.object({
        searchTerm: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.movie.findMany({
          where: {
            title: {
              contains: input.searchTerm,            
            }
          }
        });
      }),
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ ctx, input }) => {
        return ctx.db.movie.findUnique({
          where: { id: input.id },
        });
      }),
    getAll: publicProcedure
      .query(({ ctx }) => {
        return ctx.db.movie.findMany();
      }),
    getSummary: publicProcedure
      .query(({ ctx }) => {
        return ctx.db.movie.count();
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
    
    getCountOfUserAudioMessagesForAssignment: protectedProcedure
      .input(z.object({
        userId: z.string(),
        assignmentId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        return ctx.db.audioMessage.count({
          where: {
            userId: input.userId,
            assignmentId: input.assignmentId,
          },
        });
      }),
    
    getGuessesForAssignmentForUser: protectedProcedure
      .input(z.object({
        assignmentId: z.string(),
        userId: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const assignmentReviews = await ctx.db.assignmentReview.findMany({
          where: {
            assignmentId: input.assignmentId
          },
          select: {
            id: true
          }
        });

        const guesses = await ctx.db.guess.findMany({
          where: {
            assignmntReviewId: {
              in: assignmentReviews.map(ar => ar.id)
            },
            userId: input.userId ?? undefined
          },
          include: {
            Rating: true,
            AssignmentReview: {
              include: {
                Review: {
                  include: {
                    User: true
                  }
                }
              }
            }
          }
        });
        return guesses;
      }),
      
	submitGuess: protectedProcedure
		.input(z.object({
			assignmentId: z.string(),
			hostId: z.string(),
			guesserId: z.string(),
			ratingId: z.string()
		}))
		.mutation(async ({ctx, input}) => {
			return await ctx.db.$executeRaw`EXEC [SubmitGuess] @assignmentId=${input.assignmentId}, @hostId=${input.hostId}, @guesserId=${input.guesserId}, @ratingId=${input.ratingId}`
		}),
  }),

  video: createTRPCRouter({
    search: publicProcedure
      .input(z.object({searchTerm: z.string()}))
      .query(async ({ ctx, input }) => {
        // Note: This will need to be implemented with proper YouTube API integration
        throw new Error("YouTube API integration not implemented");
      })
  }),

  feature: createTRPCRouter({
    addVoteForFeature: publicProcedure
      .input(z.object({ lookupID: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.db.$executeRaw`EXEC [AddVoteForFeature] @lookupID=${input.lookupID}`;
      })
  }),
});

export type AppRouter = typeof appRouter; 