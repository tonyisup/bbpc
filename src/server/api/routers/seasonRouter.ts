import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getCurrentSeasonID } from "@/utils/points";

export const seasonRouter = createTRPCRouter({
    hasActiveSeason: publicProcedure.query(async ({ ctx }) => {
        const seasonId = await getCurrentSeasonID(ctx.db);
        return seasonId !== null;
    }),
});
