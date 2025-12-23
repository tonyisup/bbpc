import { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export const getCurrentSeasonID = async (prisma: PrismaTransactionClient): Promise<string | null> => {
  const season = await prisma.season.findFirst({
    orderBy: {
      startedOn: 'desc',
    },
    where: { endedOn: null }
  });
  return season?.id ?? null;
};

export const calculateUserPoints = async (
  prisma: PrismaTransactionClient,
  userEmail: string,
  seasonId?: string | null | undefined
) => {
  if (!userEmail) {
    console.error("calculateUserPoints: called with empty or null userEmail");
    throw new Error("User email is required to calculate points");
  }

  let seasonIdToUse = seasonId;
  if (!seasonIdToUse) {
    seasonIdToUse = await getCurrentSeasonID(prisma);
  }

  if (!seasonIdToUse) {
    // If no season is active and none was provided, user has no points for the context
    return 0;
  }

  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!user) {
    console.warn(`calculateUserPoints: User not found for email ${userEmail}`);
    throw new Error(`User not found for email ${userEmail}`);
  }

  // Calculate user's adjustment points
  const adjustmentResult = await prisma.point.aggregate({
    _sum: {
      adjustment: true,
    },
    where: {
      userId: user.id,
      seasonId: seasonIdToUse,
    },
  });

  // Calculate points from game results
  const pointsResult = await prisma.$queryRaw<{ sum: number }[]>
    `select [sum] = sum([b].[points])
from [dbo].[point] [a]
join [dbo].[gamepointtype] [b]
	on [a].[gamepointtypeid] = [b].[id]
where [a].[userid] = ${user.id}
and [a].[seasonid] = ${seasonIdToUse}
`;

  const basePoints = (pointsResult[0]?.sum ?? 0) + (adjustmentResult._sum.adjustment ?? 0);

  // Calculate points currently gambled (deduct these)
  // We assume gambled points are relevant for the current season's assignments.
  // Ideally, we'd filter by assignments attached to episodes in the current season,
  // but for now, we'll deduct all active gambling points for the user.
  // If stricter season filtering is needed, we would add:
  // where: { Assignment: { Episode: { date: { gte: season.startDate, lte: season.endDate } } } }
  // Calculate points currently gambled
  const allGamblingRows = await prisma.gamblingPoints.findMany({
    where: {
      userId: user.id
    },
    select: { points: true }
  });

  const gambledPoints = allGamblingRows.reduce((sum, row) => sum + row.points, 0);

  return basePoints - gambledPoints;
};