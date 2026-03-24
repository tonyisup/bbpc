import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getCurrentSeasonID } from "@/utils/points";

export const seasonRouter = createTRPCRouter({
    hasActiveSeason: publicProcedure.query(async ({ ctx }) => {
        const seasonId = await getCurrentSeasonID(ctx.db);
        return seasonId !== null;
    }),
    getCurrentPerformanceTracking: publicProcedure.query(async ({ ctx }) => {
        const seasonId = await getCurrentSeasonID(ctx.db);

        if (!seasonId) {
            return null;
        }

        const season = await ctx.db.season.findUnique({
            where: { id: seasonId },
            select: { id: true, title: true },
        });

        if (!season) {
            return null;
        }

        const points = await ctx.db.point.findMany({
            where: { seasonId },
            orderBy: { earnedOn: "asc" },
            select: {
                userId: true,
                earnedOn: true,
                adjustment: true,
                gamePointType: {
                    select: { points: true },
                },
                user: {
                    select: { id: true, name: true },
                },
            },
        });

        const userTotals = new Map<string, { id: string; name: string | null; total: number }>();

        for (const point of points) {
            const pointValue = Number(point.adjustment ?? 0) + Number(point.gamePointType?.points ?? 0);
            const current = userTotals.get(point.userId) ?? {
                id: point.user.id,
                name: point.user.name,
                total: 0,
            };

            current.total += pointValue;
            userTotals.set(point.userId, current);
        }

        const userSummary = Array.from(userTotals.values()).sort((a, b) => b.total - a.total);

        return {
            season,
            userSummary,
            points,
        };
    }),
});
