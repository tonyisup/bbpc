import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const gameRouter = router({
	// Points endpoint that returns all the current points of users that have points (not null)
	points: publicProcedure.query(async ({ ctx }) => {
		return ctx.prisma.user.findMany({
			where: {
				points: {
					not: null
				}
			},
			orderBy: {
				points: "desc"
			}
		})
	}),
	addPointsToUser: protectedProcedure
		.input(z.object({
			userId: z.string(),
			points: z.number()
		}))
		.mutation(async ({ ctx, input }) => {
		return ctx.prisma.user.update({
			where: {
				id: input.userId
			},
			data: {
				points: {
					increment: input.points
				}
			}
		})
	})
})
