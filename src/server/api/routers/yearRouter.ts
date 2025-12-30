import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { type Movie, type Rating, type Episode, type Review, User } from "@prisma/client";

export const yearRouter = createTRPCRouter({
	getMyYearData: publicProcedure
		.input(z.object({ year: z.number() }))
		.query(async ({ ctx, input }) => {
			const yearStart = new Date(input.year, 0, 1);
			const yearEnd = new Date(input.year + 1, 0, 1);
			const isAdmin = ctx.session?.user?.isAdmin;

			const whereClause: { userId?: string, ReviewdOn: { gte: Date, lt: Date }, Movie: { year: number } } = {
				ReviewdOn: {
					gte: yearStart,
					lt: yearEnd,
				},
				Movie: {
					year: input.year,
				},
			};

			if (isAdmin) {
				whereClause.userId = ctx.session?.user?.id;
			}

			const reviews = await ctx.db.review.findMany({
				where: whereClause,
				include: {
					Movie: true,
					User: true,
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
					id: review.id,
					movie: review.Movie,
					user: review.User,
					rating: review.Rating,
					episode: episode ?? null,
					date: review.ReviewdOn,
					reviewId: review.id,
				};
			}).filter((item): item is {
				id: string;
				movie: Movie;
				user: User;
				rating: Rating | null;
				episode: Episode | null;
				date: Date | null;
				reviewId: string;
			} => item !== null);
		}),
});
