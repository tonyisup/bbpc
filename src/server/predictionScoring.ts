import { type PrismaClient } from "@prisma/client";

const predictionPointTypes = ["guess", "allcorrect", "all-incorrect"] as const;

export type PredictionScoring = {
  correctHost: number | null;
  allCorrectBonus: number | null;
  allIncorrect: number | null;
};

export const getPredictionScoring = async (
  db: Pick<PrismaClient, "gamePointType">
): Promise<PredictionScoring> => {
  const pointTypes = await db.gamePointType.findMany({
    where: {
      lookupID: { in: [...predictionPointTypes] },
      gameType: { lookupID: "wtfir" },
    },
    select: {
      lookupID: true,
      points: true,
    },
  });
  const pointsByType = new Map(
    pointTypes.map((pointType) => [pointType.lookupID, pointType.points])
  );

  return {
    correctHost: pointsByType.get("guess") ?? null,
    allCorrectBonus: pointsByType.get("allcorrect") ?? null,
    allIncorrect: pointsByType.get("all-incorrect") ?? null,
  };
};
