'use client';

import { api } from "@/trpc/react";
import { Episode } from "./Episode";
import type { Episode as EpisodeType, Assignment, Link as EpisodeLink, Movie, User, Review, ExtraReview } from '@prisma/client';

type CompleteEpisode = EpisodeType & {
  assignments: (Assignment & {
    User: User;
    Movie: Movie | null;
  })[];
  extras: (ExtraReview & {
    Review: Review & {
      User: User;
      Movie: Movie;
    };
  })[];
  links: EpisodeLink[];
};

export function NextEpisode() {
  const { data } = api.episode.next.useQuery(undefined, {
    suspense: true,
    useErrorBoundary: true
  });

  // Type assertion to match the Episode component's expected type
  const nextEpisode = data as unknown as CompleteEpisode;
  return <Episode episode={nextEpisode} allowGuesses={true} />;
} 