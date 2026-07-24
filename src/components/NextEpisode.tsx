"use client";

import { api } from "@/trpc/react";
import { Episode } from "./Episode";

interface NextEpisodeProps {
  showExtras?: boolean;
  allowGuesses?: boolean;
}

export function NextEpisode({
  showExtras = true,
  allowGuesses = false,
}: NextEpisodeProps) {
  const { data } = api.episode.next.useQuery(undefined, {
    suspense: true,
    useErrorBoundary: true,
  });

  if (!data) return null;

  return (
    <Episode
      episode={data}
      showExtras={showExtras}
      allowGuesses={allowGuesses}
    />
  );
}
