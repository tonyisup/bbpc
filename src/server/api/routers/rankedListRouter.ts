import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const rankedListRouter = createTRPCRouter({
	// Get user's ranked lists (filtered by target type if specified)
	getMyLists: protectedProcedure
		.input(
			z.object({
				targetType: z.enum(["MOVIE", "SHOW", "EPISODE"]).optional(),
			}).optional()
		)
		.query(async ({ ctx, input }) => {
			return await ctx.db.rankedList.findMany({
				where: {
					userId: ctx.session.user.id,
					...(input?.targetType ? {
						RankedListType: {
							targetType: input.targetType,
						},
					} : {}),
				},
				include: {
					RankedListType: true,
					RankedItem: {
						include: {
							Movie: true,
							Show: true,
							Episode: true,
						},
					},
				},
				orderBy: {
					updatedAt: "desc",
				},
			});
		}),

	// Get specific list with all items
	getListById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const list = await ctx.db.rankedList.findUnique({
				where: { id: input.id },
				include: {
					RankedListType: true,
					RankedItem: {
						include: {
							Movie: true,
							Show: true,
							Episode: true,
						},
						orderBy: {
							rank: "asc",
						},
					},
				},
			});

			if (!list) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Check if user owns this list or is admin
			const userRoles = await ctx.db.userRole.findMany({
				where: { userId: ctx.session.user.id },
				include: { role: true },
			});
			const isAdmin = userRoles.some((ur) => ur.role.admin);

			if (list.userId !== ctx.session.user.id && !isAdmin) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			return list;
		}),

	// Add or update an item in a ranked list
	upsertItem: protectedProcedure
		.input(
			z.object({
				rankedListId: z.string(),
				movieId: z.string().optional(),
				showId: z.string().optional(),
				episodeId: z.string().optional(),
				rank: z.number().min(1),
				comment: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			// Get the list to verify ownership and constraints
			const list = await ctx.db.rankedList.findUnique({
				where: { id: input.rankedListId },
				include: {
					RankedListType: true,
					RankedItem: true,
				},
			});

			if (!list) {
				throw new TRPCError({ code: "NOT_FOUND", message: "List not found" });
			}

			// Check if user owns this list or is admin
			const userRoles = await ctx.db.userRole.findMany({
				where: { userId: ctx.session.user.id },
				include: { role: true },
			});
			const isAdmin = userRoles.some((ur) => ur.role.admin);

			if (list.userId !== ctx.session.user.id && !isAdmin) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			// Validate rank doesn't exceed max
			if (input.rank > list.RankedListType.maxItems) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Rank cannot exceed ${list.RankedListType.maxItems}`,
				});
			}

			// Check if item already exists at this rank
			const existingItemAtRank = list.RankedItem.find((i) => i.rank === input.rank);

			if (existingItemAtRank) {
				// Update existing item at this rank
				return await ctx.db.rankedItem.update({
					where: { id: existingItemAtRank.id },
					data: {
						movieId: input.movieId,
						showId: input.showId,
						episodeId: input.episodeId,
						comment: input.comment,
						updatedAt: new Date(),
					},
				});
			} else {
				// Create new item
				return await ctx.db.rankedItem.create({
					data: {
						rankedListId: input.rankedListId,
						movieId: input.movieId,
						showId: input.showId,
						episodeId: input.episodeId,
						rank: input.rank,
						comment: input.comment,
						updatedAt: new Date(),
					},
				});
			}
		}),

	// Remove an item from a ranked list
	removeItem: protectedProcedure
		.input(z.object({ itemId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const item = await ctx.db.rankedItem.findUnique({
				where: { id: input.itemId },
				include: { RankedList: true },
			});

			if (!item) {
				throw new TRPCError({ code: "NOT_FOUND" });
			}

			// Check if user owns the list or is admin
			const userRoles = await ctx.db.userRole.findMany({
				where: { userId: ctx.session.user.id },
				include: { role: true },
			});
			const isAdmin = userRoles.some((ur) => ur.role.admin);

			if (item.RankedList.userId !== ctx.session.user.id && !isAdmin) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			return await ctx.db.rankedItem.delete({
				where: { id: input.itemId },
			});
		}),
});
