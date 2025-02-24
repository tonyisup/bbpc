'use client';

import { api } from "@/trpc/react";
import { Episode } from "./Episode";

export function LatestEpisode() {
  const { data: latestEpisode } = api.episode.latest.useQuery();

  if (!latestEpisode) return null;

  return <Episode episode={latestEpisode} />;
} 