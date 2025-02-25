'use client';

import { api } from "@/trpc/react";
import { Episode } from "./Episode";

export function NextEpisode() {
  const { data: nextEpisode } = api.episode.next.useQuery();

  if (!nextEpisode) return null;

  return <Episode episode={nextEpisode} allowGuesses={true} />;
} 