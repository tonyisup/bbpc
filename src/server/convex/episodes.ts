import "server-only";

import { z } from "zod";

import { fetchPublicQuery, publicQueryReference } from "./client";
import type { CompleteEpisode } from "@/types/episode";

const movieSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().int(),
  poster: z.string().nullable(),
  url: z.string(),
  tmdbId: z.number().int().nullable(),
});

const showSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().int(),
  poster: z.string().nullable(),
  url: z.string(),
});

const episodeSchema = z.object({
  id: z.string(),
  number: z.number().int(),
  title: z.string(),
  recording: z.string().nullable(),
  date: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  slug: z.string().nullable(),
  assignments: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      playable: z.boolean(),
      slug: z.string().nullable(),
      user: z.object({
        id: z.string(),
        name: z.string().nullable(),
        image: z.string().nullable(),
      }),
      movie: movieSchema,
    })
  ),
  extras: z.array(
    z.object({
      id: z.string(),
      review: z.object({
        id: z.string(),
        movie: movieSchema.nullable(),
        show: showSchema.nullable(),
      }),
    })
  ),
  links: z.array(
    z.object({
      id: z.string(),
      url: z.string(),
      text: z.string(),
    })
  ),
});

const nextScheduledReference = publicQueryReference<Record<string, never>>(
  "episodes/public:nextScheduled"
);

export async function getNextScheduledEpisode(): Promise<CompleteEpisode | null> {
  const result = await fetchPublicQuery(nextScheduledReference, {});
  return episodeSchema.nullable().parse(result);
}
