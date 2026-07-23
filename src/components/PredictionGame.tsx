"use client";

import { type Rating, type User } from "@prisma/client";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Film,
  Info,
  Phone,
  Voicemail,
  X,
} from "lucide-react";
import { type FC, type ReactNode, useState } from "react";

import {
  PredictionRoundError,
  PredictionRoundState,
  getPredictionRoundState,
} from "@/lib/predictionRound.mjs";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { highlightText } from "@/utils/text";
import { type RouterOutputs } from "@/utils/trpc";

import AssignmentGamblingBoard from "./AssignmentGamblingBoard";
import PhoneNumber from "./common/PhoneNumber";
import RecordAssignmentAudio from "./common/RecordAssignmentAudio";
import RatingIcon from "./RatingIcon";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

export type PredictionGameAssignment = {
  id: string;
  movie: {
    title: string;
    poster: string | null;
  } | null;
};

type GuessInput = {
  assignmentId: string;
  hostId: string;
  ratingId: string;
};

type GuessRecord = {
  rating: Rating;
  assignmentReview?: {
    review?: {
      userId?: string | null;
      user?: User | null;
    } | null;
  } | null;
  AssignmentReview?: {
    Review?: {
      userId?: string | null;
      User?: User | null;
    } | null;
  } | null;
};

type PredictionScoring = RouterOutputs["review"]["getPredictionScoring"];

const getGuessReviewUserId = (guess: GuessRecord) =>
  guess.assignmentReview?.review?.userId ??
  guess.assignmentReview?.review?.user?.id ??
  guess.AssignmentReview?.Review?.userId ??
  guess.AssignmentReview?.Review?.User?.id ??
  null;

const findGuessForHost = (guesses: GuessRecord[], hostId: string) =>
  guesses.find((guess) => getGuessReviewUserId(guess) === hostId);

interface PredictionGameProps {
  assignments: PredictionGameAssignment[];
  userId: string;
  searchQuery?: string;
  episodeStatus: string;
}

export const PredictionGame: FC<PredictionGameProps> = ({
  assignments,
  userId,
  searchQuery = "",
  episodeStatus,
}) => {
  const hostsQuery = api.user.hosts.useQuery();
  const ratingsQuery = api.movie.ratings.useQuery();
  const seasonQuery = api.season.hasActiveSeason.useQuery();

  if (hostsQuery.isLoading || ratingsQuery.isLoading || seasonQuery.isLoading) {
    return (
      <div
        className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5 text-sm text-zinc-300"
        role="status"
      >
        Loading your picks…
      </div>
    );
  }

  if (hostsQuery.isError || ratingsQuery.isError || seasonQuery.isError) {
    return (
      <div
        className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.08] p-5"
        role="alert"
      >
        <p className="font-bold text-white">Couldn&apos;t load the game.</p>
        <p className="mt-1 text-sm text-zinc-300">
          Check your connection, then try again.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => {
            void hostsQuery.refetch();
            void ratingsQuery.refetch();
            void seasonQuery.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (seasonQuery.data === false) {
    return (
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-bold text-white">No active game season</p>
        <p className="mt-1 text-sm text-zinc-400">
          Picks will return when the next season begins.
        </p>
      </div>
    );
  }

  if (!hostsQuery.data?.length || !ratingsQuery.data?.length) {
    return (
      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-bold text-white">Picks aren&apos;t available yet</p>
        <p className="mt-1 text-sm text-zinc-400">
          The hosts and rating scale still need to be set up for this round.
        </p>
      </div>
    );
  }

  return (
    <PredictionGameData
      assignments={assignments}
      hosts={hostsQuery.data}
      ratings={[...ratingsQuery.data].sort((a, b) => b.value - a.value)}
      userId={userId}
      searchQuery={searchQuery}
      episodeStatus={episodeStatus}
    />
  );
};

const PredictionGameData: FC<{
  assignments: PredictionGameAssignment[];
  hosts: User[];
  ratings: Rating[];
  userId: string;
  searchQuery: string;
  episodeStatus: string;
}> = ({ assignments, hosts, ratings, userId, searchQuery, episodeStatus }) => {
  const assignmentIds = assignments.map((assignment) => assignment.id);
  const guessesQuery = api.review.getUsersGuessesForAssignments.useQuery({
    assignmentIds,
  });
  const audioQuery =
    api.review.getUsersAudioMessagesCountForAssignments.useQuery({
      assignmentIds,
    });
  const wagersQuery =
    api.gambling.getUsersGamblingPointsForAssignments.useQuery({
      assignmentIds,
    });
  const scoringQuery = api.review.getPredictionScoring.useQuery();

  if (guessesQuery.isLoading || audioQuery.isLoading || wagersQuery.isLoading) {
    return (
      <div
        className="mt-5 h-64 animate-pulse rounded-xl bg-white/[0.04]"
        aria-label="Loading saved picks"
        role="status"
      />
    );
  }

  if (guessesQuery.isError || audioQuery.isError || wagersQuery.isError) {
    return (
      <div
        className="mt-5 rounded-xl border border-red-500/30 bg-red-500/[0.08] p-5"
        role="alert"
      >
        <p className="font-bold text-white">
          Couldn&apos;t load your saved picks.
        </p>
        <p className="mt-1 text-sm text-zinc-300">
          Your existing choices have not been changed.
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => {
            void guessesQuery.refetch();
            void audioQuery.refetch();
            void wagersQuery.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const guessesByAssignment =
    (guessesQuery.data as Record<string, GuessRecord[]> | undefined) ?? {};
  const totalPickCount = assignments.length * hosts.length;
  const savedPickCount = assignments.reduce(
    (total, assignment) =>
      total +
      hosts.filter((host) =>
        findGuessForHost(guessesByAssignment[assignment.id] ?? [], host.id)
      ).length,
    0
  );
  const firstIncompleteIndex = assignments.findIndex((assignment) =>
    hosts.some(
      (host) =>
        !findGuessForHost(guessesByAssignment[assignment.id] ?? [], host.id)
    )
  );
  const roundState = getPredictionRoundState(episodeStatus);
  const isRoundOpen = roundState === PredictionRoundState.OPEN;

  return (
    <section className="mt-5 space-y-4" aria-label="Rating predictions">
      <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
                isRoundOpen
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-200"
              )}
            >
              {isRoundOpen ? "Round open" : "Picks locked"}
            </span>
            <div className="flex items-center gap-1">
              <p
                className="text-sm font-semibold text-white"
                aria-live="polite"
              >
                {savedPickCount} of {totalPickCount} picks saved
              </p>
              <PredictionScoringPopover
                scoring={scoringQuery.data}
                hostCount={hosts.length}
                isLoading={scoringQuery.isLoading}
                isError={scoringQuery.isError}
                onRetry={() => void scoringQuery.refetch()}
              />
            </div>
          </div>
          {savedPickCount === totalPickCount && totalPickCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300">
              <Check className="h-4 w-4" aria-hidden="true" />
              All picks complete
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Choose the rating you think each host will give. Changes save
          automatically.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4">
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="inline-flex items-center gap-2 text-sm text-zinc-300"
            >
              <RatingIcon value={rating.value} />
              <span className="font-semibold text-white">{rating.name}</span>
              {rating.category && (
                <span className="text-zinc-500">{rating.category}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {assignments.map((assignment, index) => (
        <AssignmentPrediction
          key={assignment.id}
          assignment={assignment}
          assignmentIds={assignmentIds}
          hosts={hosts}
          ratings={ratings}
          userId={userId}
          searchQuery={searchQuery}
          guesses={guessesByAssignment[assignment.id] ?? []}
          audioMessageCount={audioQuery.data?.[assignment.id] ?? 0}
          gamblePoints={wagersQuery.data?.[assignment.id] ?? []}
          episodeStatus={episodeStatus}
          initiallyExpanded={index === firstIncompleteIndex}
        />
      ))}
    </section>
  );
};

const PredictionScoringPopover = ({
  scoring,
  hostCount,
  isLoading,
  isError,
  onRetry,
}: {
  scoring: PredictionScoring | undefined;
  hostCount: number;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}) => {
  const perfectMovieTotal =
    scoring?.correctHost !== null &&
    scoring?.correctHost !== undefined &&
    scoring.allCorrectBonus !== null
      ? scoring.correctHost * hostCount + scoring.allCorrectBonus
      : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 min-w-11 px-2 text-zinc-400 hover:text-white"
          aria-label="How prediction scoring works"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Scoring</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] border-white/15 bg-zinc-950 p-4 text-zinc-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-black text-white">How picks score</p>
            <p className="mt-1 text-xs text-zinc-400">
              Scores are calculated separately for each movie.
            </p>
          </div>
          <PopoverClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 shrink-0"
              aria-label="Close scoring information"
            >
              <X aria-hidden="true" />
            </Button>
          </PopoverClose>
        </div>

        {isLoading ? (
          <p className="mt-4 text-sm text-zinc-400" role="status">
            Loading scoring…
          </p>
        ) : isError || !scoring ? (
          <div className="mt-4">
            <p className="text-sm text-zinc-300">
              Scoring details couldn&apos;t be loaded.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 min-h-11"
              onClick={onRetry}
            >
              Try again
            </Button>
          </div>
        ) : (
          <>
            <dl className="mt-4 space-y-2 text-sm">
              <ScoringRow label="Correct host" points={scoring.correctHost} />
              <ScoringRow
                label={`All ${hostCount} hosts correct`}
                points={scoring.allCorrectBonus}
                suffix="bonus"
              />
              <ScoringRow
                label={`All ${hostCount} hosts wrong`}
                points={scoring.allIncorrect}
              />
            </dl>
            {perfectMovieTotal !== null && (
              <p className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-400">
                A perfect movie earns{" "}
                <strong className="text-white">
                  {perfectMovieTotal} points total
                </strong>
                .
              </p>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

const ScoringRow = ({
  label,
  points,
  suffix,
}: {
  label: string;
  points: number | null;
  suffix?: string;
}) => (
  <div className="grid grid-cols-[1fr_auto] items-baseline gap-4 rounded-lg bg-white/[0.04] px-3 py-2">
    <dt className="text-zinc-300">{label}</dt>
    <dd className="font-black tabular-nums text-white">
      {points === null
        ? "Unavailable"
        : `${points > 0 ? "+" : ""}${points} ${
            points === 1 ? "point" : "points"
          }`}
      {points !== null && suffix ? ` ${suffix}` : ""}
    </dd>
  </div>
);

interface AssignmentPredictionProps {
  assignment: PredictionGameAssignment;
  assignmentIds: string[];
  hosts: User[];
  ratings: Rating[];
  userId: string;
  searchQuery: string;
  guesses: GuessRecord[];
  audioMessageCount: number;
  gamblePoints: Array<{ points: number }>;
  episodeStatus: string;
  initiallyExpanded: boolean;
}

const AssignmentPrediction: FC<AssignmentPredictionProps> = ({
  assignment,
  assignmentIds,
  hosts,
  ratings,
  userId,
  searchQuery,
  guesses,
  audioMessageCount,
  gamblePoints,
  episodeStatus,
  initiallyExpanded,
}) => {
  const utils = api.useUtils();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [savingHostId, setSavingHostId] = useState<string | null>(null);
  const [lastSavedHostId, setLastSavedHostId] = useState<string | null>(null);
  const [failedGuess, setFailedGuess] = useState<GuessInput | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const selectedCount = hosts.filter((host) =>
    findGuessForHost(guesses, host.id)
  ).length;
  const hasAllGuesses = hosts.length > 0 && selectedCount === hosts.length;
  const roundState = getPredictionRoundState(episodeStatus);
  const isRoundOpen = roundState === PredictionRoundState.OPEN;
  const gambleAmountForAssignment = gamblePoints.reduce(
    (total, point) => total + point.points,
    0
  );
  const guessesForGambling = guesses.map((guess) => ({
    hostId: getGuessReviewUserId(guess) ?? "",
    ratingId: guess.rating.value,
  }));

  const submitGuess = api.review.submitGuess.useMutation({
    onMutate: async (newGuess) => {
      setSavingHostId(newGuess.hostId);
      setLastSavedHostId(null);
      setFailedGuess(null);
      setSaveError(null);

      await utils.review.getUsersGuessesForAssignments.cancel({
        assignmentIds,
      });
      const previous = utils.review.getUsersGuessesForAssignments.getData({
        assignmentIds,
      });

      utils.review.getUsersGuessesForAssignments.setData(
        { assignmentIds },
        (old) => {
          const current = old?.[assignment.id] ?? [];
          const filtered = current.filter(
            (guess) => getGuessReviewUserId(guess) !== newGuess.hostId
          );
          const rating = ratings.find(
            (candidate) => candidate.id === newGuess.ratingId
          );
          const host = hosts.find(
            (candidate) => candidate.id === newGuess.hostId
          );
          if (!rating || !host) return old;

          type CachedGuess = NonNullable<typeof old>[string][number];
          const optimisticGuess = {
            id: `optimistic-${host.id}`,
            ratingId: rating.id,
            created: new Date(),
            userId: "authenticated-user",
            assignmntReviewId: "optimistic",
            seasonId: "optimistic",
            pointsId: null,
            rating,
            assignmentReview: {
              id: "optimistic",
              assignmentId: assignment.id,
              reviewId: "optimistic",
              review: {
                id: "optimistic",
                userId: host.id,
                movieId: null,
                ratingId: null,
                reviewdOn: null,
                showId: null,
                reviewedOn: null,
                user: host,
              },
            },
          } as CachedGuess;

          return {
            ...old,
            [assignment.id]: [...filtered, optimisticGuess],
          };
        }
      );

      return { previous };
    },
    onSuccess: (_result, variables) => {
      setLastSavedHostId(variables.hostId);
    },
    onError: (error, variables, context) => {
      utils.review.getUsersGuessesForAssignments.setData(
        { assignmentIds },
        context?.previous
      );
      setFailedGuess(variables);
      setSaveError(
        error.message.includes(PredictionRoundError.ROUND_LOCKED)
          ? "Picks closed before this change could be saved."
          : "Couldn’t save this pick. Check your connection and retry."
      );
    },
    onSettled: () => {
      setSavingHostId(null);
      void utils.review.getUsersGuessesForAssignments.invalidate({
        assignmentIds,
      });
    },
  });

  const chooseRating = (hostId: string, ratingId: string) => {
    if (!isRoundOpen || submitGuess.isLoading) return;
    submitGuess.mutate({
      assignmentId: assignment.id,
      hostId,
      ratingId,
    });
  };

  return (
    <article className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          {assignment.movie?.poster ? (
            <Image
              src={assignment.movie.poster}
              alt=""
              width={40}
              height={60}
              sizes="40px"
              className="h-[60px] w-10 shrink-0 rounded-md border border-white/10 object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex h-[60px] w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-zinc-500"
              aria-hidden="true"
            >
              <Film className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-black text-white">
                {assignment.movie
                  ? highlightText(assignment.movie.title, searchQuery)
                  : "Unknown movie"}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-bold",
                  hasAllGuesses
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "bg-amber-400/10 text-amber-200"
                )}
              >
                {hasAllGuesses
                  ? "Complete"
                  : selectedCount === 0
                  ? "Needs picks"
                  : `${selectedCount} of ${hosts.length} saved`}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              {isRoundOpen
                ? hasAllGuesses
                  ? "Your choices are saved. You can edit them while the round is open."
                  : `Choose ${hosts.length - selectedCount} more ${
                      hosts.length - selectedCount === 1 ? "rating" : "ratings"
                    }.`
                : "This round is closed. Your saved choices are shown below."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant={isExpanded ? "ghost" : "outline"}
          className="min-h-11 shrink-0 justify-between sm:justify-center"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded
            ? "Hide picks"
            : selectedCount > 0
            ? "View or edit picks"
            : "Make picks"}
          {isExpanded ? (
            <ChevronUp aria-hidden="true" />
          ) : (
            <ChevronDown aria-hidden="true" />
          )}
        </Button>
      </div>

      {!isExpanded && selectedCount > 0 && (
        <ul className="grid gap-x-6 gap-y-2 border-t border-white/10 px-4 py-3 sm:px-5 md:grid-cols-3">
          {hosts.map((host) => {
            const guess = findGuessForHost(guesses, host.id);
            if (!guess) return null;
            return (
              <li
                key={host.id}
                className="flex min-w-0 items-center gap-2 whitespace-nowrap text-sm text-zinc-300"
              >
                <span className="font-semibold text-white">
                  {host.name ?? "Host"}
                </span>
                <span aria-hidden="true">—</span>
                <RatingIcon value={guess.rating.value} />
                <span>{guess.rating.name}</span>
              </li>
            );
          })}
        </ul>
      )}

      {isExpanded && (
        <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
          {hosts.map((host) => {
            const guess = findGuessForHost(guesses, host.id);
            const isSaving = savingHostId === host.id;
            const didFail = failedGuess?.hostId === host.id;
            const isSaved = !isSaving && !didFail && Boolean(guess?.rating.id);

            return (
              <fieldset
                key={host.id}
                className="rounded-lg border border-white/10 bg-black/20 p-3 sm:p-4"
                disabled={!isRoundOpen || submitGuess.isLoading}
              >
                <div className="mb-3 flex min-h-6 items-center justify-between gap-3">
                  <legend className="font-bold text-white">
                    {host.name ?? "Host"}
                  </legend>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      isSaving
                        ? "text-amber-200"
                        : didFail
                        ? "text-red-300"
                        : isSaved
                        ? "text-emerald-300"
                        : "text-zinc-500"
                    )}
                    aria-live="polite"
                  >
                    {isSaving
                      ? "Saving…"
                      : didFail
                      ? "Couldn’t save"
                      : isSaved
                      ? lastSavedHostId === host.id
                        ? "Saved just now"
                        : "Saved"
                      : "Not picked"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ratings.map((rating) => {
                    const isSelected = guess?.rating.id === rating.id;
                    return (
                      <label key={rating.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name={`prediction-${assignment.id}-${host.id}`}
                          value={rating.id}
                          checked={isSelected}
                          onChange={() => chooseRating(host.id, rating.id)}
                          disabled={!isRoundOpen || submitGuess.isLoading}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-red-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black",
                            isSelected
                              ? "border-red-400 bg-red-500/15 text-white"
                              : "border-white/15 bg-white/[0.035] text-zinc-300 hover:border-white/30 hover:bg-white/[0.07]",
                            (!isRoundOpen || submitGuess.isLoading) &&
                              "cursor-not-allowed opacity-60"
                          )}
                        >
                          <RatingIcon value={rating.value} />
                          <span>{rating.name}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {saveError && failedGuess && (
            <div
              className="flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/[0.08] p-3 sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <p className="text-sm text-red-100">{saveError}</p>
              {isRoundOpen && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => submitGuess.mutate(failedGuess)}
                  disabled={submitGuess.isLoading}
                >
                  Retry save
                </Button>
              )}
            </div>
          )}

          {hasAllGuesses && (
            <details className="rounded-lg border border-white/10 bg-black/20">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-2">
                  <Coins
                    className="h-4 w-4 text-amber-300"
                    aria-hidden="true"
                  />
                  Wager points <span className="text-zinc-500">— optional</span>
                </span>
                <ChevronDown
                  className="h-4 w-4 text-zinc-400"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-white/10 p-3 sm:p-4">
                <AssignmentGamblingBoard
                  assignmentId={assignment.id}
                  hosts={hosts}
                  guesses={guessesForGambling}
                  episodeStatus={episodeStatus}
                />
              </div>
            </details>
          )}

          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 text-sm text-zinc-400">
              Calls and voice messages may qualify for discretionary bonus
              points.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Call />
              <Message
                assignmentId={assignment.id}
                userId={userId}
                count={audioMessageCount}
              />
              {(gambleAmountForAssignment > 0 || audioMessageCount > 0) && (
                <p className="self-center text-xs text-zinc-500">
                  {gambleAmountForAssignment > 0
                    ? `${gambleAmountForAssignment} points wagered`
                    : ""}
                  {gambleAmountForAssignment > 0 && audioMessageCount > 0
                    ? " · "
                    : ""}
                  {audioMessageCount > 0
                    ? `${audioMessageCount} voice ${
                        audioMessageCount === 1 ? "message" : "messages"
                      }`
                    : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

const Call = () => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="min-h-11">
        <Phone aria-hidden="true" />
        Call the show
      </Button>
    </PopoverTrigger>
    <PopoverContent onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between">
        <PhoneNumber />
        <PopoverClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            aria-label="Close phone number"
          >
            <X aria-hidden="true" />
          </Button>
        </PopoverClose>
      </div>
    </PopoverContent>
  </Popover>
);

const Message = ({
  assignmentId,
  userId,
  count,
  children,
}: {
  assignmentId: string;
  userId: string;
  count?: number;
  children?: ReactNode;
}) => (
  <Popover>
    <PopoverTrigger
      asChild
      onClick={(event) => (children ? event.stopPropagation() : undefined)}
    >
      {children ?? (
        <Button variant="outline" className="min-h-11">
          <Voicemail aria-hidden="true" />
          Record a voice message
          {count ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {count}
            </span>
          ) : null}
        </Button>
      )}
    </PopoverTrigger>
    <PopoverContent
      className="w-[calc(100vw-2rem)] sm:w-96"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-400">Record a voice message</span>
        <PopoverClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            aria-label="Close voice recorder"
          >
            <X aria-hidden="true" />
          </Button>
        </PopoverClose>
      </div>
      <RecordAssignmentAudio
        assignmentId={assignmentId}
        userId={userId}
        mode="compact"
      />
    </PopoverContent>
  </Popover>
);
