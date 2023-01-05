import { protectedProcedure, router } from "../trpc";

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => 
    await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
    })),
  myRoles: protectedProcedure.query(async  ({ ctx }) =>
    await ctx.prisma.userRole.findMany({
      where: { userId: ctx.session.user.id },
    }))
})
