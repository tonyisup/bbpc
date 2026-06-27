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
  compact?: boolean;
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

export function NextEpisode({ showExtras = true, compact = false, allowGuesses = false }: NextEpisodeProps) {
  const { data } = api.episode.next.useQuery(undefined, {
    suspense: true,
    useErrorBoundary: true
  });

  // The router returns the episode with lowercase relations (user, movie, review)
  // which matches CompleteEpisode's expected shape
  const nextEpisode = data as NonNullable<NextEpisodeOutput> as CompleteEpisode;

  if (!nextEpisode) return null;

  if (compact) {
    return (
      <section className="w-full max-w-md mx-auto px-4 py-3 bg-gray-900/30 outline-2 outline-gray-500 outline rounded-2xl flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Coming Soon</span>
          <span className="text-sm text-gray-400">{nextEpisode.number}</span>
        </div>
        <div className="text-center text-base sm:text-lg font-bold text-white px-2 py-1">
          {nextEpisode.title || "TBD"}
        </div>
        {nextEpisode.assignments.length > 0 && (
          <div className="flex justify-center gap-1 pt-1">
            {nextEpisode.assignments.map((assignment) => {
              const show = assignmentToShow(assignment);
              return (
                <div key={assignment.id} className="flex-shrink-0">
                  {assignment.movie && (
                    <MovieInlinePreview
                      movie={assignment.movie}
                      imageClassName="w-[36px] h-[54px] sm:w-[48px] sm:h-[72px]"
                      responsive={true}
                    />
                  )}
                  {!assignment.movie && show && (
                    <ShowInlinePreview
                      show={show}
                      imageClassName="w-[36px] h-[54px] sm:w-[48px] sm:h-[72px]"
                      responsive={true}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <Episode
      episode={nextEpisode}
      showExtras={showExtras}
      allowGuesses={allowGuesses}
    />
  );
}
