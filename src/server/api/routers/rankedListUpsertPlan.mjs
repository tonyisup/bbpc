/**
 * @typedef {{ id: string, rank: number, movieId?: string | null, showId?: string | null, episodeId?: string | null }} RankedItemIdentity
 * @typedef {{ rank: number, movieId?: string, showId?: string, episodeId?: string }} RankedItemTarget
 * @typedef {{ kind: "move", itemId: string, fromRank: number, toRank: number, displacedItemId?: string } | { kind: "replace", itemId: string } | { kind: "create" }} RankedItemUpsertPlan
 */

/**
 * Plans a ranked-item write without touching the database. Existing targets move
 * rather than being copied into a second row; an occupied destination swaps back
 * into the target's previous rank.
 *
 * @param {RankedItemIdentity[]} items
 * @param {RankedItemTarget} target
 * @returns {RankedItemUpsertPlan}
 */
export function planRankedItemUpsert(items, target) {
  const targetCount = [target.movieId, target.showId, target.episodeId].filter(
    (id) => id !== undefined
  ).length;
  if (targetCount !== 1) {
    throw new Error("Exactly one ranked-item target is required");
  }

  const existingTarget = items.find((item) =>
    target.movieId !== undefined
      ? item.movieId === target.movieId
      : target.showId !== undefined
      ? item.showId === target.showId
      : item.episodeId === target.episodeId
  );
  const existingAtRank = items.find((item) => item.rank === target.rank);

  if (existingTarget) {
    return {
      kind: "move",
      itemId: existingTarget.id,
      fromRank: existingTarget.rank,
      toRank: target.rank,
      ...(existingAtRank && existingAtRank.id !== existingTarget.id
        ? { displacedItemId: existingAtRank.id }
        : {}),
    };
  }

  return existingAtRank
    ? { kind: "replace", itemId: existingAtRank.id }
    : { kind: "create" };
}
