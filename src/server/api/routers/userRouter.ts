import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { calculateUserPoints } from "@/utils/points";

export const userRouter = createTRPCRouter({
	points: protectedProcedure.query(({ ctx }) => {

		if (!ctx.session.user.email) {
			throw new Error("User not found");
		}
		return calculateUserPoints(ctx.db, ctx.session.user.email);
	}),
	me: protectedProcedure.query(({ ctx }) => {
		if (!ctx.session.user.email) {
			throw new Error("User email not found in session");
		}
		return ctx.db.user.findUnique({
			where: { email: ctx.session.user.email },
		});
	}),
	update: protectedProcedure
		.input(z.object({
			name: z.string(),
		}))
		.mutation(async ({ ctx, input }) => {
			if (!ctx.session.user.email) {
				throw new Error("User email not found in session");
			}
			const user = await ctx.db.user.findUnique({
				where: { email: ctx.session.user.email },
			});
			if (!user) {
				throw new Error("User not found");
			}
			return ctx.db.user.update({
				where: { id: user.id },
				data: { name: input.name },
			});
		}),
	hosts: publicProcedure.query(async ({ ctx }) => {
		return ctx.db.user.findMany({
			where: {
				roles: {
					some: {
						role: {
							admin: true
						}
					}
				}
			}
		});
	}),
	myRoles: protectedProcedure
		.query(async ({ ctx }) =>
			await ctx.db.userRole.findMany({
				where: { userId: ctx.session.user.id },
			}))
});
