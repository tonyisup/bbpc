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
            },
        });

        const userTotals = new Map<string, { id: string; name: string | null; total: number }>();
        const flattenedPoints = points.map((point) => ({
            userId: point.userId,
            earnedOn: point.earnedOn,
            pointValue: Number(point.adjustment ?? 0) + Number(point.gamePointType?.points ?? 0),
        }));

        const users = await ctx.db.user.findMany({
            where: {
                id: {
                    in: Array.from(new Set(flattenedPoints.map((point) => point.userId))),
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const userNameById = new Map(users.map((user) => [user.id, user.name] as const));

        for (const point of flattenedPoints) {
            const current = userTotals.get(point.userId) ?? {
                id: point.userId,
                name: userNameById.get(point.userId) ?? null,
                total: 0,
            };

            current.total += point.pointValue;
            userTotals.set(point.userId, current);
        }

        const userSummary = Array.from(userTotals.values()).sort((a, b) => b.total - a.total);

        return {
            season,
            userSummary,
            points: flattenedPoints,
        };
    }),
});
