import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { calculateUserPoints, getCurrentSeasonID } from "@/utils/points";
import { TRPCError } from "@trpc/server";

export const gamblingRouter = createTRPCRouter({
	getAllActive: publicProcedure.query(({ ctx }) => {
		return ctx.db.gamblingType.findMany({
			where: { isActive: true },
		});
	}),
	submitPoints: protectedProcedure
		.input(z.object({
			userId: z.string(),
			gamblingTypeId: z.string().optional(),
			points: z.number(),
			assignmentId: z.string().optional(),
			targetUserId: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const userEmail = ctx.session.user.email;
			if (!userEmail) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "User email not found in session",
				});
			}

			const seasonId = await getCurrentSeasonID(ctx.db);
			if (!input.gamblingTypeId) {
				const defaultType = await ctx.db.gamblingType.findFirst({
					where: { lookupId: "default" },
				});
				if (!defaultType) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "No active gambling type found",
					});
				}
				input.gamblingTypeId = defaultType.id;
			}

			// Security: Always use the session user ID, don't trust the input userId
			const userId = ctx.session.user.id;

			const existingPoints = await ctx.db.gamblingPoints.findFirst({
				where: {
					userId: userId,
					gamblingTypeId: input.gamblingTypeId,
					assignmentId: input.assignmentId,
					targetUserId: input.targetUserId,
				},
			});

			// Check point affordability
			const availablePoints = await calculateUserPoints(ctx.db, userEmail);
			const currentBetPoints = existingPoints?.points ?? 0;
			const pointsDiff = input.points - currentBetPoints;

			if (pointsDiff > availablePoints) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: `Insufficient points. You are trying to bet ${input.points} points (an increase of ${pointsDiff}), but you only have ${availablePoints} available.`,
				});
			}

			if (existingPoints) {
				if (existingPoints.status !== "pending") {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Cannot update a bet that is already locked or resolved",
					});
				}
				return ctx.db.gamblingPoints.update({
					where: { id: existingPoints.id },
					data: { points: input.points },
				});
			} else {
				return ctx.db.gamblingPoints.create({
					data: {
						seasonId,
						userId: userId,
						gamblingTypeId: input.gamblingTypeId,
						points: input.points,
						assignmentId: input.assignmentId,
						targetUserId: input.targetUserId,
					},
				});
			}
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
