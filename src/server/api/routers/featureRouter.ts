import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const featureRouter = createTRPCRouter({
	addVoteForFeature: publicProcedure
		.input(z.object({ lookupID: z.string() }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.db.$executeRaw`EXEC [AddVoteForFeature] @lookupID=${input.lookupID}`;
		})
});
