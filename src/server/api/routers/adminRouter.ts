import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
	listUsers: adminProcedure.query(async ({ ctx }) => {
		// If we are impersonating, we shouldn't be here because adminProcedure would fail.
		// But just in case, we want the real admin to list users.
		return ctx.db.user.findMany({
			orderBy: { name: 'asc' },
			select: { id: true, name: true, email: true, image: true }
		});
	}),
	impersonate: adminProcedure
		.input(z.object({ userId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return ctx.db.user.update({
				where: { id: ctx.session.user.id },
				data: { impersonatedUserId: input.userId }
			});
		}),
	stopImpersonating: adminProcedure
		.mutation(async ({ ctx }) => {
			const realUserId = ctx.session.user.realUser?.id;
			if (!realUserId) {
				// If not impersonating, just clear it for the current user if they are admin
				return ctx.db.user.update({
					where: { id: ctx.session.user.id },
					data: { impersonatedUserId: null }
				});
			}
			return ctx.db.user.update({
				where: { id: realUserId },
				data: { impersonatedUserId: null }
			});
		}),
});
