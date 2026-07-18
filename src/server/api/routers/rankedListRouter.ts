import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { planRankedItemUpsert } from "./rankedListUpsertPlan.mjs";

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
						rankedListType: {
							targetType: input.targetType,
						},
					} : {}),
				},
				include: {
					rankedListType: true,
					rankedItem: {
						include: {
							movie: true,
							show: true,
							episode: true,
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
					rankedListType: true,
					rankedItem: {
						include: {
							movie: true,
							show: true,
							episode: true,
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
			z
				.object({
					rankedListId: z.string(),
					movieId: z.string().optional(),
					showId: z.string().optional(),
					episodeId: z.string().optional(),
					rank: z.number().min(1),
					comment: z.string().optional(),
				})
				.refine(
					(input) =>
						[input.movieId, input.showId, input.episodeId].filter(
							(id) => id !== undefined
						).length === 1,
					{ message: "Exactly one ranked-item target is required" }
				)
		)
		.mutation(async ({ ctx, input }) => {
			// Get the list to verify ownership and constraints
			const list = await ctx.db.rankedList.findUnique({
				where: { id: input.rankedListId },
				include: {
					rankedListType: true,
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
			if (input.rank > list.rankedListType.maxItems) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Rank cannot exceed ${list.rankedListType.maxItems}`,
				});
			}

			return await ctx.db.$transaction(async (transaction) => {
				const rankedItems = await transaction.rankedItem.findMany({
					where: { rankedListId: input.rankedListId },
				});
				const plan = planRankedItemUpsert(rankedItems, input);
				const targetData = {
					movieId: input.movieId ?? null,
					showId: input.showId ?? null,
					episodeId: input.episodeId ?? null,
					comment: input.comment,
					updatedAt: new Date(),
				};

				if (plan.kind === "move") {
					if (plan.displacedItemId) {
						await transaction.rankedItem.update({
							where: { id: plan.displacedItemId },
							data: { rank: plan.fromRank, updatedAt: new Date() },
						});
					}
					return await transaction.rankedItem.update({
						where: { id: plan.itemId },
						data: { ...targetData, rank: plan.toRank },
					});
				}

				if (plan.kind === "replace") {
					return await transaction.rankedItem.update({
						where: { id: plan.itemId },
						data: targetData,
					});
				}

				return await transaction.rankedItem.create({
					data: {
						rankedListId: input.rankedListId,
						...targetData,
						rank: input.rank,
					},
				});
			});
		}),

	// Remove an item from a ranked list
	removeItem: protectedProcedure
		.input(z.object({ itemId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const item = await ctx.db.rankedItem.findUnique({
				where: { id: input.itemId },
				include: { rankedList: true },
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

			if (item.rankedList.userId !== ctx.session.user.id && !isAdmin) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			return await ctx.db.rankedItem.delete({
				where: { id: input.itemId },
			});
		}),

	// Reorder items in a ranked list
	reorderItems: protectedProcedure
		.input(
			z.object({
				rankedListId: z.string(),
				itemIds: z.array(z.string()),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const list = await ctx.db.rankedList.findUnique({
				where: { id: input.rankedListId },
				include: { rankedListType: true },
			});

			if (!list) {
				throw new TRPCError({ code: "NOT_FOUND", message: "List not found" });
			}

			// Check ownership
			const userRoles = await ctx.db.userRole.findMany({
				where: { userId: ctx.session.user.id },
				include: { role: true },
			});
			const isAdmin = userRoles.some((ur) => ur.role.admin);

			if (list.userId !== ctx.session.user.id && !isAdmin) {
				throw new TRPCError({ code: "FORBIDDEN" });
			}

			// Perform updates in a transaction
			return await ctx.db.$transaction(
				input.itemIds.map((itemId, index) =>
					ctx.db.rankedItem.updateMany({
						where: {
							id: itemId,
							rankedListId: input.rankedListId,
						},
						data: {
							rank: index + 1,
							updatedAt: new Date(),
						},
					})
				)
			);
		}),
});
