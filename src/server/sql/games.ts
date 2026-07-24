import "server-only";

import { db } from "@/server/db";
import { getPredictionScoring } from "@/server/predictionScoring";
import { getSqlNextEpisode } from "@/server/sql/episodes";
import { toPlainDateString } from "@/lib/dates";
import { getCurrentSeasonID } from "@/utils/points";
import type { GamePerformanceData } from "@/types/game";

export async function getSqlCurrentPerformance(): Promise<GamePerformanceData | null> {
  const seasonId = await getCurrentSeasonID(db);
  if (seasonId === null) {
    return null;
  }
  const season = await db.season.findUnique({
    where: { id: seasonId },
    select: {
      id: true,
      title: true,
      endedOn: true,
    },
  });
  if (season === null) {
    return null;
  }
  const points = await db.point.findMany({
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
  const flattenedPoints = points.map((point) => ({
    userId: point.userId,
    earnedAt: point.earnedOn.getTime(),
    pointValue:
      Number(point.adjustment ?? 0) + Number(point.gamePointType?.points ?? 0),
  }));
  const users = await db.user.findMany({
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
  const names = new Map(users.map((user) => [user.id, user.name] as const));
  const totals = new Map<
    string,
    { id: string; name: string | null; total: number }
  >();
  for (const point of flattenedPoints) {
    const current = totals.get(point.userId) ?? {
      id: point.userId,
      name: names.get(point.userId) ?? null,
      total: 0,
    };
    current.total += point.pointValue;
    totals.set(point.userId, current);
  }
  return {
    season: {
      id: season.id,
      title: season.title,
      endedOn: toPlainDateString(season.endedOn),
    },
    userSummary: [...totals.values()].sort(
      (left, right) => right.total - left.total
    ),
    points: flattenedPoints,
  };
}

export async function getSqlGamePageData() {
  const [episode, predictionScoring, performance] = await Promise.all([
    getSqlNextEpisode(),
    getPredictionScoring(db),
    getSqlCurrentPerformance(),
  ]);
  return { episode, predictionScoring, performance };
}
