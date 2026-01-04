import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const episodeRouter = createTRPCRouter({
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
						movie: true,
						user: true,
						assignmentReviews: {
							include: {
								review: {
									include: {
										rating: true,
									},
								},
							},
						},
					},
				},
				extras: {
					include: {
						review: {
							include: {
								movie: true,
								user: true,
								show: true,
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
									movie: {
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
							movie: true,
							user: true,
							assignmentReviews: {
								include: {
									review: {
										include: {
											rating: true,
										},
									},
								},
							},
						},
					},
					extras: {
						include: {
							review: {
								include: {
									user: true,
									movie: true,
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
						movie: true,
						user: true,
					},
				},
				extras: {
					include: {
						review: {
							include: {
								user: true,
								movie: true,
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
							movie: true,
							user: true,
							assignmentReviews: {
								include: {
									review: {
										include: {
											rating: true,
										},
									},
								},
							},
						},
					},
					extras: {
						include: {
							review: {
								include: {
									movie: true,
									user: true,
								},
							},
						},
					},
					links: true,
				},
			});
		}),
});
