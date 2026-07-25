"use client";

import { api } from "@/trpc/react";

import { HistoryPageClient } from "./HistoryPageClient";

export function SqlHistoryPage() {
  const { data: allEpisodes, isLoading } = api.episode.history.useQuery(
    undefined,
    {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  return (
    <HistoryPageClient
      allEpisodes={allEpisodes}
      isLoading={isLoading}
    />
  );
}
