import { PrismaClient } from "@prisma/client";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export const calculateUserPoints = async (
  prisma: PrismaTransactionClient,
  userEmail: string,
  seasonId?: string | null | undefined
) => {
  let seasonIdToUse = seasonId;
  if (!seasonIdToUse) {
    const season = await prisma.season.findFirst({
      orderBy: {
        startedOn: 'desc',
      },
      where: { endedOn: null }
    });
    seasonIdToUse = season?.id ?? '';
  }

  const user = await prisma.user.findFirst({
    where: { email: userEmail },
  });
  if (!user) {
    throw new Error("User not found for email " + userEmail);
  }

  const adjustmentResult = await prisma.point.aggregate({
    _sum: {
      adjustment: true,
    },
    where: {
      userId: user.id,
      seasonId: seasonIdToUse,
    },
  });

  const pointsResult = await prisma.$queryRaw<{ sum: number }[]>
    `select [sum] = sum([b].[points])
from [dbo].[point] [a]
join [dbo].[gamepointtype] [b]
	on [a].[gamepointtypeid] = [b].[id]
where [a].[userid] = ${user.id}
and [a].[seasonid] = ${seasonIdToUse}
`;

  return (pointsResult[0]?.sum ?? 0)
    + (adjustmentResult._sum.adjustment ?? 0);
};

export const getCurrentSeasonID = async (prisma: PrismaTransactionClient) => {
  const season = await prisma.season.findFirst({
    orderBy: {
      startedOn: 'desc',
    },
    where: { endedOn: null }
  });
  return season?.id ?? '';
};