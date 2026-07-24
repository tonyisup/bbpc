import "server-only";

import { z } from "zod";

import type { EpisodeResultsData } from "@/types/episode";

const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  image: z.string().nullable(),
});

const movieSchema = z.object({
  id: z.string(),
  title: z.string(),
  year: z.number().int(),
  poster: z.string().nullable(),
  url: z.string(),
  tmdbId: z.number().int().nullable(),
});

const assignmentSchema = z.object({
  movie: movieSchema,
  gamblingPoints: z.array(
    z.object({
      id: z.string(),
      user: userSchema,
      points: z.number(),
      status: z.string(),
      gamblingType: z.object({
        title: z.string(),
        multiplier: z.number(),
      }),
    })
  ),
  assignmentReviews: z.array(
    z.object({
      review: z.object({
        ratingId: z.string().nullable(),
        rating: z
          .object({
            value: z.number(),
          })
          .nullable(),
        user: userSchema.nullable(),
      }),
      guesses: z.array(
        z.object({
          id: z.string(),
          user: userSchema,
          ratingId: z.string(),
        })
      ),
    })
  ),
});

export function mapSqlEpisodeResults(input: unknown): EpisodeResultsData {
  const assignments = z.array(assignmentSchema).parse(input);

  return {
    gamblingWinners: assignments.flatMap((assignment) =>
      assignment.gamblingPoints
        .filter((entry) => entry.status === "won")
        .map((entry) => ({
          id: entry.id,
          user: entry.user,
          points: entry.points,
          gamblingType: entry.gamblingType,
          movie: assignment.movie,
        }))
    ),
    guessWinners: assignments.flatMap((assignment) =>
      assignment.assignmentReviews.flatMap((assignmentReview) => {
        const { review } = assignmentReview;
        if (
          review.ratingId === null ||
          review.rating === null ||
          review.user === null
        ) {
          return [];
        }
        const ratingId = review.ratingId;
        const rating = review.rating;
        const host = review.user;
        return assignmentReview.guesses
          .filter((guess) => guess.ratingId === ratingId)
          .map((guess) => ({
            id: guess.id,
            user: guess.user,
            host,
            actualRating: rating.value,
            movie: assignment.movie,
          }));
      })
    ),
  };
}
