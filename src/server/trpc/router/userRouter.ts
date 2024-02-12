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
  me: protectedProcedure.query(async ({ ctx }) => 
    await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    })),
  myRoles: protectedProcedure.query(async  ({ ctx }) =>
    await ctx.prisma.userRole.findMany({
      where: { userId: ctx.session.user.id },
    }))
})
