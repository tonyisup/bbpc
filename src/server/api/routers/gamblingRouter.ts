import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { getCurrentSeasonID } from "@/utils/points";

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
			const seasonId = await getCurrentSeasonID(ctx.db);
			if (!input.gamblingTypeId) {
				const defaultType = await ctx.db.gamblingType.findFirst({
					where: { lookupId: "default" },
				});
				if (!defaultType) throw new Error("No active gambling type found");
				input.gamblingTypeId = defaultType.id;
			}
			const existingPoints = await ctx.db.gamblingPoints.findFirst({
				where: {
					userId: input.userId,
					gamblingTypeId: input.gamblingTypeId,
					assignmentId: input.assignmentId,
					targetUserId: input.targetUserId,
				},
			});

			if (existingPoints) {
				if (existingPoints.status !== "pending") {
					throw new Error("Cannot update a bet that is already locked or resolved");
				}
				return ctx.db.gamblingPoints.update({
					where: { id: existingPoints.id },
					data: { points: input.points },
				});
			} else {
				return ctx.db.gamblingPoints.create({
					data: {
						seasonId,
						userId: input.userId,
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
