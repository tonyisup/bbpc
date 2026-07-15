'use client';

import { api } from "@/trpc/react";
import { Episode, type CompleteEpisode } from "./Episode";
import { type RouterOutputs } from "@/utils/trpc";
import MovieInlinePreview from "./MovieInlinePreview";
import ShowInlinePreview from "./ShowInlinePreview";
import type { Show } from "@prisma/client";

// Derive the type directly from the router output
type NextEpisodeOutput = RouterOutputs['episode']['next'];

interface NextEpisodeProps {
  showExtras?: boolean;
  allowGuesses?: boolean;
}

function assignmentToShow(assignment: CompleteEpisode["assignments"][number]): Show | null {
  const show = (assignment as any).show as Show | undefined;
  if (!show) return null;
  return {
    id: show.id,
    title: show.title,
    year: show.year,
    poster: show.poster,
    url: show.url,
  };
}

export function NextEpisode({ showExtras = true, allowGuesses = false }: NextEpisodeProps) {
  const { data } = api.episode.next.useQuery(undefined, {
    suspense: true,
    useErrorBoundary: true
  });

  // The router returns the episode with lowercase relations (user, movie, review)
  // which matches CompleteEpisode's expected shape
  const nextEpisode = data as NonNullable<NextEpisodeOutput> as CompleteEpisode;

  if (!nextEpisode) return null;

  return (
    <Episode
      episode={nextEpisode}
      showExtras={showExtras}
      allowGuesses={allowGuesses}
    />
  );
}
