import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
	hosts: publicProcedure.query(async ({ ctx }) => {
		return ctx.prisma.user.findMany({
			where: {
				roles: {
					some: {
						role: {
							admin: true
						}
					}
				}
			}
		})
	}),
	update: protectedProcedure
		.input(z.object({
			name: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
		return await ctx.prisma.user.update({
			where: { id: ctx.session.user.id },
			data: {
				name: input.name
			}
		})
	}),
  me: protectedProcedure.query(async ({ ctx }) => 
    await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    })),
  myRoles: protectedProcedure.query(async  ({ ctx }) =>
    await ctx.prisma.userRole.findMany({
      where: { userId: ctx.session.user.id },
    }))
})
