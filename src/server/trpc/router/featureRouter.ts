import type { Rating } from "@prisma/client";
import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const featureRouter = router({
	addVoteForFeature: publicProcedure
	.input(z.object({ lookupID: z.string() }))
	.mutation(async (req) => {
		return await req.ctx.prisma.$executeRaw`EXEC [AddVoteForFeature] @lookupID=${req.input.lookupID}`
	}),
})
