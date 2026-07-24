import "server-only";

import { z } from "zod";

import { fetchQueryForSignedInUser, publicQueryReference } from "./client";

const hasWonForEpisodeReference = publicQueryReference<{
  episodeId: string;
}>("games/gambling:hasWonForEpisode");

export async function hasSignedInUserWonForEpisode(
  episodeId: string
): Promise<boolean> {
  const result = await fetchQueryForSignedInUser(hasWonForEpisodeReference, {
    episodeId,
  });
  return result === null ? false : z.boolean().parse(result);
}
