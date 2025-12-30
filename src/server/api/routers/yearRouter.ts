import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { type Movie, type Rating, type Episode, type Review } from "@prisma/client";

export const yearRouter = createTRPCRouter({
  getMyYearData: protectedProcedure
    .input(z.object({ year: z.number() }))
    .query(async ({ ctx, input }) => {
      const yearStart = new Date(input.year, 0, 1);
      const yearEnd = new Date(input.year + 1, 0, 1);
      const isAdmin = ctx.session.user.isAdmin;

      if (isAdmin) {
        // Admin Logic: Movies released in Year AND Reviewed by Admin in Year
        const reviews = await ctx.db.review.findMany({
          where: {
            userId: ctx.session.user.id,
            ReviewdOn: {
              gte: yearStart,
              lt: yearEnd,
            },
            Movie: {
              year: input.year,
            },
          },
          include: {
            Movie: true,
            Rating: true,
            extraReviews: {
              include: {
                Episode: true,
              },
            },
            assignmentReviews: {
              include: {
                Assignment: {
                  include: {
                    Episode: true,
                  },
                },
              },
            },
          },
        });

        // Normalize data
        return reviews.map((review) => {
          // Find the episode
          let episode = review.extraReviews[0]?.Episode;
          if (!episode) {
            episode = review.assignmentReviews[0]?.Assignment?.Episode;
          }

          if (!review.Movie) return null;

          return {
            id: review.Movie.id,
            movie: review.Movie,
            rating: review.Rating,
            episode: episode ?? null,
            date: review.ReviewdOn,
            reviewId: review.id,
          };
        }).filter((item): item is {
            id: string;
            movie: Movie;
            rating: Rating | null;
            episode: Episode | null;
            date: Date | null;
            reviewId: string | null;
        } => item !== null);
      } else {
        // User Logic: Syllabus Movies reviewed on Podcast in Year

        // 1. Get User's Syllabus Movie IDs
        const syllabusItems = await ctx.db.syllabus.findMany({
            where: {
                userId: ctx.session.user.id
            },
            select: {
                movieId: true
            }
        });

        if (syllabusItems.length === 0) {
            return [];
        }

        const movieIds = syllabusItems.map(s => s.movieId);

        // 2. Find Movies in that list that were reviewed on an episode in the year
        const movies = await ctx.db.movie.findMany({
            where: {
                id: { in: movieIds },
                OR: [
                    {
                        assignments: {
                            some: {
                                Episode: {
                                    date: {
                                        gte: yearStart,
                                        lt: yearEnd
                                    }
                                }
                            }
                        }
                    },
                    {
                        reviews: {
                            some: {
                                extraReviews: {
                                    some: {
                                        Episode: {
                                            date: {
                                                gte: yearStart,
                                                lt: yearEnd
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                assignments: {
                    where: {
                        Episode: {
                            date: {
                                gte: yearStart,
                                lt: yearEnd
                            }
                        }
                    },
                    include: {
                        Episode: true
                    }
                },
                reviews: {
                    where: {
                        OR: [
                            {
                                extraReviews: {
                                    some: {
                                        Episode: {
                                            date: {
                                                gte: yearStart,
                                                lt: yearEnd
                                            }
                                        }
                                    }
                                }
                            },
                             {
                                 assignmentReviews: {
                                     some: {
                                         Assignment: {
                                             Episode: {
                                                 date: {
                                                     gte: yearStart,
                                                     lt: yearEnd
                                                 }
                                             }
                                         }
                                     }
                                 }
                             }
                        ]
                    },
                    include: {
                        extraReviews: {
                            where: {
                                Episode: {
                                    date: {
                                        gte: yearStart,
                                        lt: yearEnd
                                    }
                                }
                            },
                            include: {
                                Episode: true
                            }
                        },
                        assignmentReviews: {
                            where: {
                                Assignment: {
                                    Episode: {
                                        date: {
                                            gte: yearStart,
                                            lt: yearEnd
                                        }
                                    }
                                }
                            },
                            include: {
                                Assignment: {
                                    include: {
                                        Episode: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Normalize data
        return movies.map(movie => {
            // Find the episode.
            let episode: Episode | null | undefined = movie.assignments[0]?.Episode;

            if (!episode) {
                // Check reviews (extras)
                for (const review of movie.reviews) {
                    if (review.extraReviews && review.extraReviews.length > 0 && review.extraReviews[0]) {
                        episode = review.extraReviews[0].Episode;
                        if (episode) break;
                    }
                    if (review.assignmentReviews && review.assignmentReviews.length > 0 && review.assignmentReviews[0]) {
                        episode = review.assignmentReviews[0].Assignment.Episode;
                        if (episode) break;
                    }
                }
            }

            if (!episode) return null;

            return {
                id: movie.id,
                movie: movie,
                rating: null,
                episode: episode,
                date: episode.date,
                reviewId: null,
            };
        }).filter((item): item is {
            id: string;
            movie: Movie;
            rating: Rating | null;
            episode: Episode | null;
            date: Date | null;
            reviewId: string | null;
        } => item !== null);
      }
    }),
});
