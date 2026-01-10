import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const videoRouter = createTRPCRouter({
	search: publicProcedure
		.input(z.object({ searchTerm: z.string() }))
		.query(async ({ ctx, input }) => {
			return ctx.yt.getVideos(input.searchTerm);
		})
});
