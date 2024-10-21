import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";

export const reviewRouter = router({
	addGuess: protectedProcedure
		.input(z.object({
			userId: z.string(),
			ratingId: z.string(),
			assignmentReviewId: z.string()
		}))
		.mutation(async (req) => {
			return await req.ctx.prisma.guess.create({
				data: {
					ratingId: req.input.ratingId,
					userId: req.input.userId,
					assignmntReviewId: req.input.assignmentReviewId,
					points: 0,
					created: new Date(),
					seasonId: '83024ECB-D6AA-403A-966C-DF53E24ABB0B' /* TODO: get seasonId from episodeId */
				}
			})
		}),
	getGuessesForAssignmentForUser: protectedProcedure
		.input(z.object({ 
			assignmentId: z.string(),
			userId: z.string().optional()
		}))
		.query(async (req) => {
			return await req.ctx.prisma.guess.findMany({
				where: {
					AssignmentReview: {
						Assignment: {
							id: req.input.assignmentId
						}
					},
					userId: req.input.userId
				},
				include: {
					Rating: true,
					AssignmentReview: {
						include: {
							Review: {
								include: {
									User: true,
								}
							}
						}
					}
				}
			})
		}),
	submitGuess: protectedProcedure
		.input(z.object({
			assignmentId: z.string(),
			hostId: z.string(),
			guesserId: z.string(),
			ratingId: z.string()
		}))
		.mutation(async (req) => {
			return await req.ctx.prisma.$executeRaw`EXEC [SubmitGuess] @assignmentId=${req.input.assignmentId}, @hostId=${req.input.hostId}, @guesserId=${req.input.guesserId}, @ratingId=${req.input.ratingId}`
		}),
	getRating: publicProcedure
		.input(z.object({id: z.string()}))
		.query(async (req) => {
			return await req.ctx.prisma.rating.findUnique({
				where: {
					id: req.input.id
				}
			})
		}),
	getRatingByValue: publicProcedure
		.input(z.object({value: z.number()}))
		.query(async (req) => {
			const results = await req.ctx.prisma.rating.findMany({
				where: {
					value: req.input.value
				}
			})
			return results[0]
		}),
	getRatings: publicProcedure
		.query(async (req) => {
			return await req.ctx.prisma.rating.findMany()
		}),
	add: protectedProcedure
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
	remove: protectedProcedure
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
	updateAudioMessage: protectedProcedure
		.input(
			z.object({
				id: z.number(), 
				assignmentId: z.string(),
				fileKey: z.string()
		}))
		.mutation(async (req) => {
			return await req.ctx.prisma.audioMessage.update({
				where: {
					id: req.input.id
				},
				data: {
					assignmentId: req.input.assignmentId,
					fileKey: req.input.fileKey
				}
			})
		}),
	getCountOfUserAudioMessagesForAssignment: publicProcedure
		.input(z.object({assignmentId: z.string(), userId: z.string()}))
		.query(async (req) => {
			return await req.ctx.prisma.audioMessage.count({
				where: { assignmentId: req.input.assignmentId, userId: req.input.userId }
			})
		})
})