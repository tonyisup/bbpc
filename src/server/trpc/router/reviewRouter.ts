import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const reviewRouter = router({
	add: publicProcedure
		.input(z.object({
			ratingId: z.string().optional(),
			movieId: z.string(),
			userId: z.string(),
			episodeId: z.string()
		}))
		.mutation(async (req) => {
			return await req.ctx.prisma.review.create({
				data: {
					ratingId: req.input.ratingId,
					movieId: req.input.movieId,
					userId: req.input.userId,
					extraReviews: {
						create: {
							episodeId: req.input.episodeId
						}
					}
				},
			})
		}),
	remove: publicProcedure
		.input(z.object({id: z.string()}))
		.mutation(async (req) => {
			return await req.ctx.prisma.review.delete({
				where: {
					id: req.input.id
				}
			})
		}),
	getForEpisode: publicProcedure
		.input(z.object({episodeId: z.string()}))
		.query(async (req) => {
			return await req.ctx.prisma.review.findMany({
				include: {
					Movie: true,
					User: true,
					assignmentReviews: {
						where: {
							Assignment: {
								is: {
									Episode: {
										is: {
											id: req.input.episodeId
										}
									}
								}
							}
						},
					}
				}
			})
		}),
})