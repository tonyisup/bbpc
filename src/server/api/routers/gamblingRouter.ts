import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { getCurrentSeasonID, calculateUserPoints } from "@/utils/points";

export const gamblingRouter = createTRPCRouter({
	getAllActive: publicProcedure.query(({ ctx }) => {
		return ctx.db.gamblingType.findMany({
			where: { isActive: true },
		});
	}),
	submitPoints: protectedProcedure
		.input(z.object({
			gamblingTypeId: z.string().optional(),
			points: z.number(),
			assignmentId: z.string().optional(),
			targetUserId: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			if (input.points < 0) {
				throw new Error("Bet amount must be non-negative");
			}

			const callerId = ctx.session.user.id;
			const seasonId = await getCurrentSeasonID(ctx.db);
			if (!input.gamblingTypeId) {
				const defaultType = await ctx.db.gamblingType.findFirst({
					where: { lookupId: "default" },
				});
				if (!defaultType) throw new Error("No active gambling type found");
				input.gamblingTypeId = defaultType.id;
			}

			// Perform everything inside a transaction to prevent race conditions on balance verification
			return await ctx.db.$transaction(async (tx) => {
				const existingPoints = await tx.gamblingPoints.findFirst({
					where: {
						userId: callerId,
						gamblingTypeId: input.gamblingTypeId,
						assignmentId: input.assignmentId,
						targetUserId: input.targetUserId,
					},
				});

				const availablePoints = await calculateUserPoints(tx, ctx.session.user.email, seasonId);
				const currentBetAmount = existingPoints ? existingPoints.points : 0;
				if (input.points > availablePoints + currentBetAmount) {
					throw new Error("Not enough points available to place this bet");
				}

				if (existingPoints) {
					if (existingPoints.status !== "pending") {
						throw new Error("Cannot update a bet that is already locked or resolved");
					}
					return tx.gamblingPoints.update({
						where: { id: existingPoints.id },
						data: { points: input.points },
					});
				} else {
					return tx.gamblingPoints.create({
						data: {
							seasonId,
							userId: callerId,
							gamblingTypeId: input.gamblingTypeId,
							points: input.points,
							assignmentId: input.assignmentId,
							targetUserId: input.targetUserId,
						},
					});
				}
			});
		}),
	getForAssignment: protectedProcedure
		.input(z.object({ assignmentId: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.db.gamblingPoints.findMany({
				where: {
					assignmentId: input.assignmentId,
					userId: ctx.session.user.id,
				},
				include: {
					gamblingType: true,
					targetUser: true,
				}
			});
		}),
	getUsersGamblingPointsForActiveEvents: protectedProcedure
		.query(async ({ ctx }) => {
			if (!ctx.session.user.id) throw new Error("User not authenticated");
			return ctx.db.gamblingPoints.findMany({
				where: {
					userId: ctx.session.user.id,
					gamblingType: { isActive: true }
				},
				include: { gamblingType: true }
			});
		}),
	getGamblingPointsForType: protectedProcedure
		.input(z.object({ gamblingTypeId: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			if (!ctx.session.user.id) throw new Error("User not authenticated");
			if (!input.gamblingTypeId) {
				const defaultType = await ctx.db.gamblingType.findFirst({
					where: { lookupId: "default" },
				});
				if (!defaultType) throw new Error("No active gambling type found");
				input.gamblingTypeId = defaultType.id;
			}
			return ctx.db.gamblingPoints.findMany({
				where: {
					gamblingTypeId: input.gamblingTypeId,
					userId: ctx.session.user.id,
				},
				include: { gamblingType: true }
			});
		}),
	getUsersGamblingPointsForAssignments: protectedProcedure
		.input(z.object({
			assignmentIds: z.array(z.string()),
		}))
		.query(async ({ ctx, input }) => {
			const points = await ctx.db.gamblingPoints.findMany({
				where: {
					assignmentId: { in: input.assignmentIds },
					userId: ctx.session.user.id,
				},
				include: {
					gamblingType: true,
				},
			});

			const result: Record<string, typeof points> = {};
			for (const p of points) {
				if (p.assignmentId) {
					if (!result[p.assignmentId]) {
						result[p.assignmentId] = [];
					}
					result[p.assignmentId]?.push(p);
				}
			}
			return result;
		}),
});
