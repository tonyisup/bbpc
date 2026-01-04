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

			const whereClause: {
				userId?: string,
				reviewdOn: { gte: Date, lt: Date },
				movie: { year: number }
			} = {
				reviewdOn: {
					gte: yearStart,
					lt: yearEnd,
				},
				movie: {
					year: input.year,
				},
			};

			if (isAdmin) {
				whereClause.userId = ctx.session?.user?.id;
			}

			const reviews = await ctx.db.review.findMany({
				where: whereClause,
				include: {
					movie: true,
					user: true,
					rating: true,
					extraReviews: {
						include: {
							episode: true,
						},
					},
					assignmentReviews: {
						include: {
							assignment: {
								include: {
									episode: true,
								},
							},
						},
					},
				},
			});

			// Normalize data
			return reviews.map((review) => {
				// Find the episode
				let episode = review.extraReviews[0]?.episode;
				if (!episode) {
					episode = review.assignmentReviews[0]?.assignment?.episode;
				}

				if (!review.movie) return null;

				return {
					id: review.id,
					movie: review.movie,
					user: review.user,
					rating: review.rating,
					episode: episode ?? null,
					date: review.reviewdOn,
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
