import { type FC } from "react";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import type {
  Assignment as PrismaAssignment,
  Link as EpisodeLink,
  Movie,
  Show,
  User,
} from "@prisma/client";
import Link from "next/link";
import { AddExtraToNext } from "./AddExtraToNext";
import { highlightText } from "@/utils/text";
import ShowInlinePreview from "./ShowInlinePreview";
import {
  PredictionGame,
  type PredictionGameAssignment,
} from "./PredictionGame";
import { getEpisodePath } from "@/lib/routes";
import { formatPlainDate } from "@/lib/dates";

/**
 * Represents an episode with all its related assignments, extras, and links.
 */
type EpisodeAssignment = PrismaAssignment & {
  movie: Movie | null;
  user: User;
  assignmentReviews?: any[];
  gamblingPoints?: any[];
};
export type EpisodeExtra = {
  id: string;
  review: {
    movie?: Movie | null;
    show?: Show | null;
  };
};

export type CompleteEpisode = {
  id: string;
  slug?: string | null;
  number: number;
  title: string;
  recording: string | null;
  date: Date | null;
  description: string | null;
  status: string | null;
  assignments: EpisodeAssignment[];
  extras: EpisodeExtra[];
  links: EpisodeLink[];
};

const mapEpisodeToPredictionAssignment = (
  assignment: EpisodeAssignment
): PredictionGameAssignment | null => {
  if (!assignment.playable) {
    return null;
  }

  return {
    id: assignment.id,
    movie: assignment.movie ? { title: assignment.movie.title } : null,
  };
};

/**
 * Props for the Episode component.
 */
interface EpisodeProps {
  /** Whether to allow the prediction game (guesses) for this episode. */
  allowGuesses?: boolean;
  /** Whether to explicitly show movie titles under the movie/show previews. */
  showMovieTitles?: boolean;
  /** Search query for highlighting relevant text within the episode details. */
  searchQuery?: string;
  /** The complete episode data. */
  episode: CompleteEpisode;
}

/**
 * Renders a full episode section, including the header (title, date, number), assignments, extras, and links.
 */

export const Episode: FC<EpisodeProps> = ({
  episode,
  allowGuesses: isNextEpisode,
  showMovieTitles = false,
  searchQuery = "",
}) => {
  if (!episode) return null;
  if (isNextEpisode == null) isNextEpisode = false;
  const predictionAssignments = episode.assignments
    .map(mapEpisodeToPredictionAssignment)
    .filter(
      (assignment): assignment is PredictionGameAssignment =>
        assignment !== null
    );

  return (
    <section className="flex flex-col justify-between gap-2 rounded-2xl bg-transparent px-2 outline outline-2 outline-gray-500">
      <div className="">
        <div className="flex items-center justify-between gap-2 px-1 font-bold sm:items-baseline sm:justify-around">
          <div className="sm:text-md whitespace-nowrap p-1 text-sm sm:p-2">
            <Link href={getEpisodePath(episode.slug ?? episode.id)}>
              {episode?.number}
            </Link>
          </div>
          <div className="flex flex-grow items-center justify-center gap-2 p-2 text-center text-lg leading-tight sm:text-xl md:text-2xl">
            {!episode?.recording &&
              highlightText(episode?.title ?? "", searchQuery)}
            {episode?.recording && (
              <a
                className="underline"
                title={episode?.title}
                href={episode.recording ?? ""}
                target="_blank"
                rel="noreferrer"
              >
                {highlightText(episode?.title ?? "", searchQuery)}
              </a>
            )}
          </div>
          <div className="sm:text-md whitespace-nowrap p-1 text-sm sm:p-2">
            {episode?.date && (
              <p>
                {formatPlainDate(
                  episode.date,
                  { month: "2-digit", day: "2-digit", year: "2-digit" },
                  "en-US"
                )}
              </p>
            )}
          </div>
        </div>
        <div className="w-full text-center">
          <p>{highlightText(episode?.description ?? "", searchQuery)}</p>
        </div>
        <EpisodeAssignments
          assignments={episode.assignments}
          showMovieTitles={showMovieTitles}
          searchQuery={searchQuery}
        />
        {isNextEpisode && predictionAssignments.length > 0 && (
          <PredictionGame
            assignments={predictionAssignments}
            searchQuery={searchQuery}
            episodeStatus={episode.status ?? ""}
          />
        )}
      </div>
      <div>
        {episode.extras.length > 0 && (
          <>
            <hr className="my-2 border-gray-500" />
            <span className="text-xs">Extras</span>
            <EpisodeExtras
              extras={episode.extras}
              showMovieTitles={showMovieTitles}
              searchQuery={searchQuery}
            />
          </>
        )}
        {isNextEpisode && <AddExtraToNext episode={episode} />}
        <EpisodeLinks links={episode.links} />
      </div>
    </section>
  );
};

/**
 * Props for the EpisodeAssignments component.
 */
interface EpisodeAssignments {
  showMovieTitles?: boolean;
  assignments: EpisodeAssignment[];
  searchQuery?: string;
}

/**
 * Renders a list of assignments for an episode, sorted by type (Homework -> Extra Credit -> Bonus).
 */

const EpisodeAssignments: FC<EpisodeAssignments> = ({
  assignments,
  showMovieTitles = false,
  searchQuery = "",
}) => {
  if (!assignments || assignments.length == 0) return null;
  return (
    <div className="flex justify-around gap-2">
      {assignments
        .sort((a, b) => {
          const typeOrder = { HOMEWORK: 0, EXTRA_CREDIT: 1, BONUS: 2 };
          return (
            typeOrder[a.type as keyof typeof typeOrder] -
            typeOrder[b.type as keyof typeof typeOrder]
          );
        })
        .map((assignment) => {
          return (
            <div
              key={assignment.id}
              className="flex flex-col items-center justify-between gap-2"
            >
              <Assignment
                assignment={assignment}
                key={assignment.id}
                showMovieTitles={showMovieTitles}
                searchQuery={searchQuery}
              />
            </div>
          );
        })}
    </div>
  );
};

/**
 * Props for the EpisodeExtras component.
 */
interface EpisodeExtras {
  showMovieTitles?: boolean;
  searchQuery?: string;
  extras: EpisodeExtra[];
}

/**
 * Renders the "Extras" section for an episode, showing previews of additional movies or shows discussed.
 */

const EpisodeExtras: FC<EpisodeExtras> = ({
  extras,
  showMovieTitles = false,
  searchQuery = "",
}) => {
  if (!extras || extras.length == 0) return null;
  return (
    <div className="py-2t">
      <div className="flex flex-wrap justify-center gap-2 pb-2">
        {extras.map((extra) => {
          const extraTitle = extra.review.movie
            ? `${extra.review.movie.title} (${extra.review.movie.year})`
            : extra.review.show
            ? `${extra.review.show.title} (${extra.review.show.year})`
            : "";

          return (
            <div
              key={extra.id}
              className="flex w-12 items-center gap-2 sm:w-36"
            >
              <div className="flex flex-col items-center gap-2">
                {extra.review.movie && (
                  <MovieInlinePreview
                    movie={extra.review.movie}
                    searchQuery={searchQuery}
                    responsive
                  />
                )}
                {extra.review.show && (
                  <ShowInlinePreview
                    show={extra.review.show}
                    searchQuery={searchQuery}
                    responsive
                  />
                )}
                {showMovieTitles && extraTitle && (
                  <div className="text-sm text-gray-500">
                    {highlightText(extraTitle, searchQuery)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Props for the EpisodeLinks component.
 */
interface EpisodeLinkProps {
  links: EpisodeLink[];
}

/**
 * Renders a list of links associated with an episode (e.g., social media or reference links).
 */
const EpisodeLinks: FC<EpisodeLinkProps> = ({ links }) => {
  if (!links || links.length == 0) return null;
  return (
    <div className="mt-4 w-full">
      <div className="flex flex-col flex-wrap items-center justify-center gap-2">
        {links.map((link) => {
          return (
            <a key={link.id} href={link.url}>
              {link.text}
            </a>
          );
        })}
      </div>
    </div>
  );
};
