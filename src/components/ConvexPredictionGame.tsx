"use client";

import { useConvex } from "convex/react";
import { Check, ChevronDown, ChevronUp, Film, Info } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FC,
} from "react";

import RatingIcon from "@/components/RatingIcon";
import { Button } from "@/components/ui/button";
import {
  type ConvexPredictionData,
  type ConvexPredictionGuess,
  type ConvexPredictionHost,
  type ConvexPredictionRating,
  loadConvexPredictionData,
  submitConvexPrediction,
} from "@/convex/predictions";
import { getConvexDomainErrorCode } from "@/convex/identity";
import {
  PredictionRoundState,
  getPredictionRoundState,
} from "@/lib/predictionRound.mjs";
import { cn } from "@/lib/utils";
import { highlightText } from "@/utils/text";
import type { PredictionGameAssignment } from "@/components/PredictionGame";

function saveError(error: unknown): string {
  switch (getConvexDomainErrorCode(error)) {
    case "WRITE_DISABLED":
      return "Prediction changes are paused while this environment is read-only.";
    case "STALE_CLIENT":
      return "This page is out of date. Refresh it before trying again.";
    case "CONFLICT":
      return "Picks closed before this change could be saved.";
    case "VALIDATION_FAILED":
      return "That prediction is no longer valid for this round.";
    default:
      return "Couldn’t save this pick. Check your connection and retry.";
  }
}

function findGuessForHost(guesses: ConvexPredictionGuess[], hostId: string) {
  return guesses.find((guess) => guess.hostId === hostId);
}

export function ConvexPredictionGame({
  assignments,
  episodeStatus,
  searchQuery = "",
}: {
  assignments: PredictionGameAssignment[];
  episodeStatus: string;
  searchQuery?: string;
}) {
  const convex = useConvex();
  const [data, setData] = useState<ConvexPredictionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadGenerationRef = useRef(0);
  const assignmentIds = useMemo(
    () => assignments.map((assignment) => assignment.id),
    [assignments]
  );

  const reload = useCallback(async () => {
    const generation = loadGenerationRef.current + 1;
    loadGenerationRef.current = generation;
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await loadConvexPredictionData(convex, assignmentIds);
      if (loadGenerationRef.current === generation) {
        setData(result);
      }
    } catch {
      if (loadGenerationRef.current === generation) {
        setLoadError(
          "Couldn’t load the game. Check your connection and retry."
        );
      }
    } finally {
      if (loadGenerationRef.current === generation) {
        setIsLoading(false);
      }
    }
  }, [assignmentIds, convex]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (isLoading && data === null) {
    return (
      <div
        className="h-64 animate-pulse rounded-xl bg-white/[0.04]"
        aria-label="Loading saved picks"
        role="status"
      />
    );
  }

  if (loadError !== null && data === null) {
    return (
      <div
        className="rounded-xl border border-red-500/30 bg-red-500/[0.08] p-5"
        role="alert"
      >
        <p className="font-bold text-white">Couldn&apos;t load the game.</p>
        <p className="mt-1 text-sm text-zinc-300">{loadError}</p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => void reload()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (data === null) {
    return null;
  }

  if (!data.activeSeason) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-bold text-white">No active game season</p>
        <p className="mt-1 text-sm text-zinc-400">
          Picks will return when the next season begins.
        </p>
      </div>
    );
  }

  if (data.hosts.length === 0 || data.ratings.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="font-bold text-white">Picks aren&apos;t available yet</p>
        <p className="mt-1 text-sm text-zinc-400">
          The hosts and rating scale still need to be set up for this round.
        </p>
      </div>
    );
  }

  const totalPickCount = assignments.length * data.hosts.length;
  const savedPickCount = assignments.reduce(
    (total, assignment) =>
      total +
      data.hosts.filter((host) =>
        findGuessForHost(data.guessesByAssignment[assignment.id] ?? [], host.id)
      ).length,
    0
  );
  const firstIncompleteIndex = assignments.findIndex((assignment) =>
    data.hosts.some(
      (host) =>
        !findGuessForHost(
          data.guessesByAssignment[assignment.id] ?? [],
          host.id
        )
    )
  );
  const isRoundOpen =
    getPredictionRoundState(episodeStatus) === PredictionRoundState.OPEN;

  return (
    <section className="space-y-4" aria-label="Rating predictions">
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
            <p className="text-sm font-semibold text-white" aria-live="polite">
              {savedPickCount} of {totalPickCount} picks saved
            </p>
          </div>
          {savedPickCount === totalPickCount && totalPickCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-300">
              <Check className="h-4 w-4" aria-hidden="true" />
              All picks complete
            </span>
          ) : null}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Choose the rating you think each host will give. Changes save
          automatically.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4">
          {data.ratings.map((rating) => (
            <div
              key={rating.id}
              className="inline-flex items-center gap-2 text-sm text-zinc-300"
            >
              <RatingIcon value={rating.value} />
              <span className="font-semibold text-white">{rating.name}</span>
              {rating.category ? (
                <span className="text-zinc-500">{rating.category}</span>
              ) : null}
            </div>
          ))}
        </div>
        <details className="mt-4 border-t border-white/10 pt-3 text-sm">
          <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 [&::-webkit-details-marker]:hidden">
            <Info className="h-4 w-4" aria-hidden="true" />
            How picks score
          </summary>
          <dl className="grid gap-2 pb-2 pt-1 sm:grid-cols-3">
            <ScoringItem
              label="Correct host"
              points={data.scoring.correctHost}
            />
            <ScoringItem
              label="All hosts correct"
              points={data.scoring.allCorrectBonus}
            />
            <ScoringItem
              label="All hosts wrong"
              points={data.scoring.allIncorrect}
            />
          </dl>
        </details>
      </div>

      {loadError !== null ? (
        <div
          className="rounded-lg border border-red-500/30 bg-red-500/[0.08] p-3 text-sm text-red-100"
          role="alert"
        >
          {loadError} Your currently displayed choices have not been changed.
        </div>
      ) : null}

      {assignments.map((assignment, index) => (
        <ConvexAssignmentPrediction
          key={assignment.id}
          assignment={assignment}
          hosts={data.hosts}
          ratings={data.ratings}
          guesses={data.guessesByAssignment[assignment.id] ?? []}
          episodeStatus={episodeStatus}
          searchQuery={searchQuery}
          initiallyExpanded={index === firstIncompleteIndex}
          onGuessSaved={(guess) => {
            setData((current) => {
              if (current === null) {
                return current;
              }
              const existing = current.guessesByAssignment[assignment.id] ?? [];
              return {
                ...current,
                guessesByAssignment: {
                  ...current.guessesByAssignment,
                  [assignment.id]: [
                    ...existing.filter(
                      (candidate) => candidate.hostId !== guess.hostId
                    ),
                    guess,
                  ],
                },
              };
            });
          }}
          onGuessRemoved={(hostId) => {
            setData((current) => {
              if (current === null) {
                return current;
              }
              return {
                ...current,
                guessesByAssignment: {
                  ...current.guessesByAssignment,
                  [assignment.id]: (
                    current.guessesByAssignment[assignment.id] ?? []
                  ).filter((candidate) => candidate.hostId !== hostId),
                },
              };
            });
          }}
        />
      ))}
    </section>
  );
}

function ScoringItem({
  label,
  points,
}: {
  label: string;
  points: number | null;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="font-black tabular-nums text-white">
        {points === null ? "Unavailable" : `${points > 0 ? "+" : ""}${points}`}
      </dd>
    </div>
  );
}

interface ConvexAssignmentPredictionProps {
  assignment: PredictionGameAssignment;
  hosts: ConvexPredictionHost[];
  ratings: ConvexPredictionRating[];
  guesses: ConvexPredictionGuess[];
  episodeStatus: string;
  searchQuery: string;
  initiallyExpanded: boolean;
  onGuessSaved: (guess: ConvexPredictionGuess) => void;
  onGuessRemoved: (hostId: string) => void;
}

const ConvexAssignmentPrediction: FC<ConvexAssignmentPredictionProps> = ({
  assignment,
  hosts,
  ratings,
  guesses,
  episodeStatus,
  searchQuery,
  initiallyExpanded,
  onGuessSaved,
  onGuessRemoved,
}) => {
  const convex = useConvex();
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [savingHostId, setSavingHostId] = useState<string | null>(null);
  const [lastSavedHostId, setLastSavedHostId] = useState<string | null>(null);
  const [failedPick, setFailedPick] = useState<{
    hostId: string;
    ratingId: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const selectedCount = hosts.filter((host) =>
    findGuessForHost(guesses, host.id)
  ).length;
  const hasAllGuesses = hosts.length > 0 && selectedCount === hosts.length;
  const isRoundOpen =
    getPredictionRoundState(episodeStatus, assignment.playable) ===
    PredictionRoundState.OPEN;

  const chooseRating = async (hostId: string, ratingId: string) => {
    if (!isRoundOpen || savingHostId !== null) {
      return;
    }
    const rating = ratings.find((candidate) => candidate.id === ratingId);
    if (rating === undefined) {
      return;
    }
    const previousGuess = findGuessForHost(guesses, hostId);
    const optimisticGuess: ConvexPredictionGuess = {
      id: previousGuess?.id ?? `pending:${assignment.id}:${hostId}`,
      hostId,
      rating,
    };
    setSavingHostId(hostId);
    setLastSavedHostId(null);
    setFailedPick(null);
    setErrorMessage(null);
    onGuessSaved(optimisticGuess);
    try {
      const saved = await submitConvexPrediction(convex, {
        assignmentId: assignment.id,
        hostId,
        ratingId,
      });
      onGuessSaved(saved);
      setLastSavedHostId(hostId);
    } catch (error) {
      if (previousGuess !== undefined) {
        onGuessSaved(previousGuess);
      } else {
        onGuessRemoved(hostId);
      }
      setFailedPick({ hostId, ratingId });
      setErrorMessage(saveError(error));
    } finally {
      setSavingHostId(null);
    }
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

      {!isExpanded && selectedCount > 0 ? (
        <ul className="grid gap-x-6 gap-y-2 border-t border-white/10 px-4 py-3 sm:px-5 md:grid-cols-3">
          {hosts.map((host) => {
            const guess = findGuessForHost(guesses, host.id);
            return guess ? (
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
            ) : null;
          })}
        </ul>
      ) : null}

      {isExpanded ? (
        <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
          {hosts.map((host) => {
            const guess = findGuessForHost(guesses, host.id);
            const isSaving = savingHostId === host.id;
            const didFail = failedPick?.hostId === host.id;
            const isSaved = !isSaving && !didFail && Boolean(guess?.rating.id);
            return (
              <fieldset
                key={host.id}
                className="rounded-lg border border-white/10 bg-black/20 p-3 sm:p-4"
                disabled={!isRoundOpen || savingHostId !== null}
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
                          name={`convex-prediction-${assignment.id}-${host.id}`}
                          value={rating.id}
                          checked={isSelected}
                          onChange={() => void chooseRating(host.id, rating.id)}
                          disabled={!isRoundOpen || savingHostId !== null}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-red-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-black",
                            isSelected
                              ? "border-red-400 bg-red-500/15 text-white"
                              : "border-white/15 bg-white/[0.035] text-zinc-300 hover:border-white/30 hover:bg-white/[0.07]",
                            (!isRoundOpen || savingHostId !== null) &&
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

          {errorMessage !== null && failedPick !== null ? (
            <div
              className="flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/[0.08] p-3 sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <p className="text-sm text-red-100">{errorMessage}</p>
              {isRoundOpen ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    void chooseRating(failedPick.hostId, failedPick.ratingId)
                  }
                  disabled={savingHostId !== null}
                >
                  Retry save
                </Button>
              ) : null}
            </div>
          ) : null}

          {hasAllGuesses ? (
            <div className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-sm text-amber-100">
              Wagering and assignment voice messages are temporarily read-only
              while their Convex clients are migrated.
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
};
