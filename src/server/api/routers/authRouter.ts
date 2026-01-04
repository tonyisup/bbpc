import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";

export const authRouter = createTRPCRouter({
	getSession: publicProcedure.query(({ ctx }) => {
		return ctx.session;
	}),
	isAdmin: protectedProcedure.query(async ({ ctx }) => {
		const userRoles = await ctx.db.userRole.findMany({
			where: { userId: ctx.session.user.id },
			include: { role: true },
		});
		return userRoles.some(ur => ur.role.admin);
	}),
	isHost: protectedProcedure.query(async ({ ctx }) => {
		const userRoles = await ctx.db.userRole.findMany({
			where: { userId: ctx.session.user.id },
			include: { role: true },
		});
		return userRoles.some(ur => ur.role.name === 'Host');
	}),
	getPhoneNumber: publicProcedure.query(async () => {
		const phoneNumber = process.env.PHONE_NUMBER;
		if (!phoneNumber) {
			return null;
		}
		return phoneNumber;
	}),
	getSecretMessage: protectedProcedure
		.query(() => {
			return "you can now see this secret message!";
		}),
	verifyRecaptcha: publicProcedure
		.input(z.object({ token: z.string() }))
		.mutation(async ({ input }) => {
			const secretKey = process.env.RECAPTCHA_SECRET_KEY;
			const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${input.token}`;

			const response = await fetch(verificationUrl, { method: 'POST' });
			const data = await response.json();

			return { success: data.success };
		}),
});
