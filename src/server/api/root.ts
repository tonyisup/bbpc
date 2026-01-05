import { z } from "zod";
import { type Rating } from "@prisma/client";
import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "@/server/api/trpc";
import { syllabusRouter } from "./routers/syllabus";
import { Decimal } from "@prisma/client/runtime/client";
import { showRouter } from "./routers/showRouter";
import { uploadInfoRouter } from "./routers/uploadInfo";
import { calculateUserPoints, getCurrentSeasonID } from "@/utils/points";
import { tagRouter } from "./routers/tagRouter";
import { yearRouter } from "./routers/yearRouter";
import { rankedListRouter } from "./routers/rankedListRouter";

export const appRouter = createTRPCRouter({
	year: yearRouter,
	tag: tagRouter,
	rankedList: rankedListRouter,
	uploadInfo: uploadInfoRouter,
	episode: createTRPCRouter({
		next: publicProcedure.query(async ({ ctx }) => {
			return ctx.db.episode.findFirst({
				where: {
					status: {
						in: ["next", "recording"]
					}
				},
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
									Show: true,
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
		getCountOfUserEpisodeAudioMessages: protectedProcedure
			.input(z.object({
				episodeId: z.string(),
			}))
			.query(async ({ ctx, input }) => {
				return ctx.db.audioEpisodeMessage.count({
					where: {
						userId: ctx.session.user.id,
						episodeId: input.episodeId,
					},
				});
			}),
		getUserAudioMessages: protectedProcedure
			.input(z.object({
				episodeId: z.string(),
			}))
			.query(async ({ ctx, input }) => {
				return ctx.db.audioEpisodeMessage.findMany({
					where: {
						userId: ctx.session.user.id,
						episodeId: input.episodeId,
					},
					orderBy: {
						id: 'desc'
					}
				});
			}),
		deleteAudioMessage: protectedProcedure
			.input(z.object({
				id: z.number(),
			}))
			.mutation(async ({ ctx, input }) => {
				// Ensure the user owns the message before deleting
				const message = await ctx.db.audioEpisodeMessage.findUnique({
					where: { id: input.id }
				});

				if (!message || message.userId !== ctx.session.user.id) {
					throw new Error("Unauthorized or message not found");
				}

				return ctx.db.audioEpisodeMessage.delete({
					where: { id: input.id },
				});
			}),
		updateAudioMessage: protectedProcedure
			.input(z.object({
				id: z.number(),
				episodeId: z.string(),
				fileKey: z.string(),
				notes: z.string().optional(),
			}))
			.mutation(async ({ ctx, input }) => {
				return await ctx.db.audioEpisodeMessage.update({
					where: {
						id: input.id,
						userId: ctx.session.user.id,
					},
					data: {
						episodeId: input.episodeId,
						fileKey: input.fileKey,
						notes: input.notes,
					}
				});
			}),
		getById: publicProcedure
			.input(z.object({ id: z.string() }))
			.query(async ({ ctx, input }) => {
				return ctx.db.episode.findUnique({
					where: { id: input.id },
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
		isHost: protectedProcedure.query(async ({ ctx }) => {
			const userRoles = await ctx.db.userRole.findMany({
				where: { userId: ctx.session.user.id },
				include: { role: true },
			});
			return userRoles.some(ur => ur.role.name === 'Host');
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
		points: protectedProcedure.query(({ ctx }) => {

			if (!ctx.session.user.email) {
				throw new Error("User not found");
			}
			return calculateUserPoints(ctx.db, ctx.session.user.email);
		}),
		me: protectedProcedure.query(({ ctx }) => {
			if (!ctx.session.user.email) {
				throw new Error("User email not found in session");
			}
			return ctx.db.user.findUnique({
				where: { email: ctx.session.user.email },
			});
		}),
		update: protectedProcedure
			.input(z.object({
				name: z.string(),
			}))
			.mutation(async ({ ctx, input }) => {
				if (!ctx.session.user.email) {
					throw new Error("User email not found in session");
				}
				const user = await ctx.db.user.findUnique({
					where: { email: ctx.session.user.email },
				});
				if (!user) {
					throw new Error("User not found");
				}
				return ctx.db.user.update({
					where: { id: user.id },
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
		searchByPage: publicProcedure
			.input(z.object({
				page: z.number(),
				term: z.string(),
			}))
			.query(async ({ ctx, input }) => {
				return ctx.tmdb.getMovies(input.page, input.term)
			}),
		search: protectedProcedure
			.input(z.object({
				term: z.string(),
			}))
			.query(async ({ ctx, input }) => {
				if (input.term.length === 0) {
					return [];
				}
				if (!isNaN(parseInt(input.term)) && input.term.length === 4) {
					const year = parseInt(input.term);
					return ctx.db.movie.findMany({
						where: {
							OR: [
								{
									title: {
										contains: input.term,
									},
								},
								{
									year: {
										equals: parseInt(input.term),
									},
								},
							],
						},
						orderBy: {
							title: 'asc',
						},
						take: 10,
					});
				}
				return ctx.db.movie.findMany({
					where: {
						title: {
							contains: input.term,
						},
					},
					orderBy: {
						title: 'asc',
					},
					take: 10,
				});
			}),
		getTitle: protectedProcedure
			.input(z.object({
				id: z.number(),
			}))
			.query(({ ctx, input }) => {
				return ctx.tmdb.getMovie(input.id)
			}),

		add: publicProcedure
			.input(z.object({
				title: z.string(),
				year: z.number(),
				poster: z.string(),
				url: z.string(),
				tmdbId: z.number().optional(),
			}))
			.mutation(async ({ ctx, input }) => {
				const exists = await ctx.db.movie.findFirst({
					where: {
						url: input.url
					}
				})
				if (exists) {
					return await ctx.db.movie.update({
						where: {
							id: exists.id
						},
						data: {
							title: input.title,
							year: input.year,
							poster: input.poster,
							url: input.url,
							tmdbId: input.tmdbId,
						}
					})
				}
				return await ctx.db.movie.create({
					data: {
						title: input.title,
						year: input.year,
						poster: input.poster,
						url: input.url,
						tmdbId: input.tmdbId,
					}
				})
			}),
		searchByNext10Page: protectedProcedure
			.input(z.object({
				term: z.string(),
				page: z.number(),
			}))
			.query(async ({ ctx, input }) => {
				if (input.term.length === 0) {
					return [];
				}
				if (!isNaN(parseInt(input.term)) && input.term.length === 4) {
					const year = parseInt(input.term);
					return ctx.db.movie.findMany({
						where: {
							OR: [
								{
									title: {
										contains: input.term,
									},
								},
								{
									year: {
										equals: parseInt(input.term),
									},
								},
							],
						},
						orderBy: {
							title: 'asc',
						},
						take: 10,
						skip: input.page * 10,
					});
				}
				return ctx.db.movie.findMany({
					where: {
						title: {
							contains: input.term,
						},
					},
					orderBy: {
						title: 'asc',
					},
					take: 10,
					skip: input.page * 10,
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
		addMovie: protectedProcedure
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
		addShow: protectedProcedure
			.input(z.object({
				userId: z.string(),
				showId: z.string(),
				episodeId: z.string(),
			}))
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
			.input(z.object({
				userId: z.string(),
				assignmentId: z.string(),
				points: z.number(),
			}))
			.mutation(async ({ ctx, input }) => {
				// Check if user has already submitted gambling points for this assignment
				const existingPoints = await ctx.db.gamblingPoints.findFirst({
					where: {
						userId: input.userId,
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
							userId: input.userId,
							assignmentId: input.assignmentId,
							points: input.points,
						},
					});
				}
			}),

		getUsersGuessesForAssignments: protectedProcedure
			.input(z.object({
				assignmentIds: z.array(z.string()),
				userId: z.string()
			}))
			.query(async ({ ctx, input }) => {
				const assignmentReviews = await ctx.db.assignmentReview.findMany({
					where: {
						assignmentId: { in: input.assignmentIds }
					},
					select: {
						id: true,
						assignmentId: true
					}
				});

				const guesses = await ctx.db.guess.findMany({
					where: {
						assignmntReviewId: {
							in: assignmentReviews.map(ar => ar.id)
						},
						userId: input.userId
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

				// Group guesses by assignmentId
				const result: Record<string, typeof guesses> = {};
				for (const ar of assignmentReviews) {
					result[ar.assignmentId] = guesses.filter(g => g.assignmntReviewId === ar.id);
				}
				return result;
			}),

		getUsersGamblingPointsForAssignments: protectedProcedure
			.input(z.object({
				assignmentIds: z.array(z.string())
			}))
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
						Assignment: {
							select: {
								Movie: {
									select: {
										title: true
									}
								}
							}
						}
					}
				});

				const result: Record<string, typeof gamblingPoints> = {};
				for (const gp of gamblingPoints) {
					if (!result[gp.assignmentId]) result[gp.assignmentId] = [];
					result[gp.assignmentId]!.push(gp);
				}
				return result;
			}),

		getUsersAudioMessagesCountForAssignments: protectedProcedure
			.input(z.object({
				assignmentIds: z.array(z.string()),
			}))
			.query(async ({ ctx, input }) => {
				const counts = await ctx.db.audioMessage.groupBy({
					by: ['assignmentId'],
					where: {
						userId: ctx.session.user.id,
						assignmentId: { in: input.assignmentIds },
					},
					_count: {
						_all: true
					}
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
			.input(z.object({
				assignmentId: z.string(),
			}))
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
						Assignment: {
							select: {
								Movie: {
									select: {
										title: true
									}
								}
							}
						}
					}
				});
			}),

		getCountOfUserAudioMessagesForAssignment: protectedProcedure
			.input(z.object({
				assignmentId: z.string(),
			}))
			.query(async ({ ctx, input }) => {
				return ctx.db.audioMessage.count({
					where: {
						userId: ctx.session.user.id,
						assignmentId: input.assignmentId,
					},
				});
			}),

		getUserAudioMessagesForAssignment: protectedProcedure
			.input(z.object({
				assignmentId: z.string(),
			}))
			.query(async ({ ctx, input }) => {
				return ctx.db.audioMessage.findMany({
					where: {
						userId: ctx.session.user.id,
						assignmentId: input.assignmentId,
					},
					orderBy: {
						id: 'desc'
					}
				});
			}),

		deleteAudioMessage: protectedProcedure
			.input(z.object({
				id: z.number(),
			}))
			.mutation(async ({ ctx, input }) => {
				// Ensure the user owns the message before deleting
				const message = await ctx.db.audioMessage.findUnique({
					where: { id: input.id }
				});

				if (!message || message.userId !== ctx.session.user.id) {
					throw new Error("Unauthorized or message not found");
				}

				return ctx.db.audioMessage.delete({
					where: { id: input.id },
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
			.mutation(async ({ ctx, input }) => {
				const seasonId = await getCurrentSeasonID(ctx.db);
				if (!seasonId) {
					throw new Error("No active season found");
				}

				const assignment = await ctx.db.assignment.findUnique({
					where: { id: input.assignmentId }
				});

				if (!assignment) {
					throw new Error("Assignment not found");
				}

				// Find or create the review for the host
				let review = await ctx.db.review.findFirst({
					where: {
						userId: input.hostId,
						movieId: assignment.movieId
					}
				});

				if (!review) {
					review = await ctx.db.review.create({
						data: {
							userId: input.hostId,
							movieId: assignment.movieId,
							ReviewdOn: null
						}
					});
				}

				// Find or create the assignment review link
				let assignmentReview = await ctx.db.assignmentReview.findFirst({
					where: {
						assignmentId: input.assignmentId,
						reviewId: review.id
					}
				});

				if (!assignmentReview) {
					assignmentReview = await ctx.db.assignmentReview.create({
						data: {
							assignmentId: input.assignmentId,
							reviewId: review.id
						}
					});
				}

				// Find or create/update the guess
				const existingGuess = await ctx.db.guess.findFirst({
					where: {
						assignmntReviewId: assignmentReview.id,
						userId: ctx.session.user.id
					}
				});

				if (existingGuess) {
					return await ctx.db.guess.update({
						where: { id: existingGuess.id },
						data: { ratingId: input.ratingId }
					});
				} else {
					return await ctx.db.guess.create({
						data: {
							ratingId: input.ratingId,
							userId: ctx.session.user.id,
							assignmntReviewId: assignmentReview.id,
							seasonId: seasonId,
							created: new Date()
						}
					});
				}
			}),

		updateAudioMessage: protectedProcedure
			.input(
				z.object({
					id: z.number(),
					assignmentId: z.string(),
					fileKey: z.string()
				}))
			.mutation(async ({ ctx, input }) => {
				return await ctx.db.audioMessage.update({
					where: {
						id: input.id,
						userId: ctx.session.user.id
					},
					data: {
						assignmentId: input.assignmentId,
						fileKey: input.fileKey
					}
				})
			}),
		getRating: publicProcedure
			.input(z.object({ id: z.string() }))
			.query(async ({ ctx, input }) => {
				return await ctx.db.rating.findUnique({
					where: {
						id: input.id
					}
				})
			}),
		getRatingByValue: publicProcedure
			.input(z.object({ value: z.number() }))
			.query(async ({ ctx, input }) => {
				const results = await ctx.db.rating.findMany({
					where: {
						value: input.value
					}
				})
				return results[0]
			}),
		getRatings: publicProcedure
			.query(async ({ ctx }) => {
				return await ctx.db.rating.findMany()
			}),
	}),

	admin: createTRPCRouter({
		listUsers: adminProcedure.query(async ({ ctx }) => {
			// If we are impersonating, we shouldn't be here because adminProcedure would fail.
			// But just in case, we want the real admin to list users.
			return ctx.db.user.findMany({
				orderBy: { name: 'asc' },
				select: { id: true, name: true, email: true, image: true }
			});
		}),
		impersonate: adminProcedure
			.input(z.object({ userId: z.string() }))
			.mutation(async ({ ctx, input }) => {
				return ctx.db.user.update({
					where: { id: ctx.session.user.id },
					data: { impersonatedUserId: input.userId }
				});
			}),
		stopImpersonating: adminProcedure
			.mutation(async ({ ctx }) => {
				const realUserId = ctx.session.user.realUser?.id;
				if (!realUserId) {
					// If not impersonating, just clear it for the current user if they are admin
					return ctx.db.user.update({
						where: { id: ctx.session.user.id },
						data: { impersonatedUserId: null }
					});
				}
				return ctx.db.user.update({
					where: { id: realUserId },
					data: { impersonatedUserId: null }
				});
			}),
	}),

	video: createTRPCRouter({
		search: publicProcedure
			.input(z.object({ searchTerm: z.string() }))
			.query(async ({ ctx, input }) => {
				return ctx.yt.getVideos(input.searchTerm);
			})
	}),

	feature: createTRPCRouter({
		addVoteForFeature: publicProcedure
			.input(z.object({ lookupID: z.string() }))
			.mutation(async ({ ctx, input }) => {
				return await ctx.db.$executeRaw`EXEC [AddVoteForFeature] @lookupID=${input.lookupID}`;
			})
	}),

	syllabus: syllabusRouter,
	show: showRouter,
});

export type AppRouter = typeof appRouter; 
