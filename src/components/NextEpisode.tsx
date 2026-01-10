'use client';

import { api } from "@/trpc/react";
import { Episode, type CompleteEpisode } from "./Episode";
import { type RouterOutputs } from "@/utils/trpc";

// Derive the type directly from the router output
type NextEpisodeOutput = RouterOutputs['episode']['next'];

export function NextEpisode() {
  const { data } = api.episode.next.useQuery(undefined, {
    suspense: true,
    useErrorBoundary: true
  });

  // The router returns the episode with lowercase relations (user, movie, review)
  // which matches CompleteEpisode's expected shape
  const nextEpisode = data as NonNullable<NextEpisodeOutput> as CompleteEpisode;
  return <Episode episode={nextEpisode} allowGuesses={true} />;
}
