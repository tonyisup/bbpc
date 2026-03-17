"use client";

import { type FC, useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { type User, type Rating } from "@prisma/client";
import { highlightText } from "@/utils/text";
import { cn } from "@/lib/utils";
import RatingIcon from "./RatingIcon";
import { SignInButton } from "./Auth";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Phone,
  Voicemail,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "./ui/popover";
import PhoneNumber from "./common/PhoneNumber";
import RecordAssignmentAudio from "./common/RecordAssignmentAudio";
import { useFeatureFlagEnabled } from "posthog-js/react";
import UserTag from "./UserTag";
import AssignmentGamblingBoard from "./AssignmentGamblingBoard";

export type PredictionGameAssignment = {
  id: string;
  movie: {
    title: string;
  } | null;
};
/**
 * Props for the PredictionGame component.
 */
interface PredictionGameProps {
  /** Array of assignments with their related data (Episode, Movie, etc.). */
  assignments: PredictionGameAssignment[];
  /** Optional search query for highlighting text in the game. */
  searchQuery?: string;
  episodeStatus: string;
}

/**
 * The main container for the prediction game, allowing users to predict ratings for hosts.
 * Renders a list of assignments where users can select ratings for each host and place bets.
 *
 * @param assignments - List of assignments to be shown.
 * @param searchQuery - Text to be highlighted (e.g., from a search bar).
 */

export const PredictionGame: FC<PredictionGameProps> = ({
  assignments,
  searchQuery = "",
  episodeStatus,
}) => {
  const { data: session } = api.auth.getSession.useQuery();
  const { data: hosts } = api.user.hosts.useQuery();
  const { data: ratings } = api.movie.ratings.useQuery();
  const { data: hasActiveSeason } = api.season.hasActiveSeason.useQuery();
  const [isAdminCollapsed, setIsAdminCollapsed] = useState(true);
  const flagEnabled = useFeatureFlagEnabled("new-season-format");

  if (hasActiveSeason === false) return null;
  if (hasActiveSeason === undefined)
    return (
      <div className="p-4 text-center text-gray-400">
        Checking season status...
      </div>
    );
  if (!session?.user)
    return (
      <div className="p-4 text-center text-gray-400">
        Please <SignInButton /> to play the game.
      </div>
    );
  if (!hosts || !ratings)
    return (
      <div className="p-4 text-center text-gray-400">
        Loading prediction game...
      </div>
    );
  const isAdmin = session.user.isAdmin;

  return (
    <div className="mt-6 flex flex-col gap-6 rounded-xl border border-gray-700 bg-gray-900/50 p-4 shadow-xl backdrop-blur-sm sm:gap-8 sm:p-6">
      <div
        className={cn(
          "flex flex-col gap-2 pb-4",
          isAdmin ? "cursor-pointer select-none" : "border-b border-gray-700"
        )}
        onClick={() => isAdmin && setIsAdminCollapsed(!isAdminCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="bg-gradient-to-r from-red-300 to-red-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
              Prediction Game
            </h2>
            {(!isAdmin || !isAdminCollapsed) && (
              <p className="text-xs text-gray-400 sm:text-sm">
                Predict what rating each host will give to the movies!
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Admin
              </span>
              {isAdminCollapsed ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>

      {(!isAdmin || !isAdminCollapsed) && (
        <div className="flex flex-col gap-10">
          <PredictionGameDataWrapper
            assignments={assignments}
            hosts={hosts}
            ratings={ratings}
            userId={session.user?.id ?? ""}
            searchQuery={searchQuery}
            episodeStatus={episodeStatus}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Internal wrapper to handle data fetching for multiple assignments at once.
 */
const PredictionGameDataWrapper: FC<{
  assignments: PredictionGameAssignment[];
  hosts: User[];
  ratings: Rating[];
  userId: string;
  searchQuery: string;
  episodeStatus: string;
}> = ({ assignments, hosts, ratings, userId, searchQuery, episodeStatus }) => {
  const assignmentIds = assignments.map((a) => a.id);

  const { data: allGuesses, isLoading: isLoadingGuesses } =
    api.review.getUsersGuessesForAssignments.useQuery({
      assignmentIds,
      userId,
    });

  const { data: allAudioMessageCounts, isLoading: isLoadingAudio } =
    api.review.getUsersAudioMessagesCountForAssignments.useQuery({
      assignmentIds,
    });

  const { data: allGamblePoints, isLoading: isLoadingGambling } =
    api.gambling.getUsersGamblingPointsForAssignments.useQuery({
      assignmentIds,
    });

  if (isLoadingGuesses || isLoadingAudio || isLoadingGambling) {
    return <div className="h-64 animate-pulse rounded-lg bg-gray-800/50"></div>;
  }

  return (
    <>
      {assignments.map((assignment) => (
        <AssignmentPrediction
          key={assignment.id}
          assignment={assignment}
          hosts={hosts}
          ratings={ratings}
          userId={userId}
          searchQuery={searchQuery}
          initialGuesses={allGuesses?.[assignment.id] ?? []}
          initialAudioMessageCount={allAudioMessageCounts?.[assignment.id] ?? 0}
          initialGamblePoints={allGamblePoints?.[assignment.id] ?? []}
          episodeStatus={episodeStatus}
        />
      ))}
    </>
  );
};

/**
 * Props for the AssignmentPrediction component.
 */
interface AssignmentPredictionProps {
  /** The specific assignment being predicted. */
  assignment: PredictionGameAssignment;
  /** List of hosts for whom guesses are being made. */
  hosts: User[];
  /** List of available ratings that can be chosen. */
  ratings: Rating[];
  /** The ID of the currently logged-in user making the predictions. */
  userId: string;
  /** The search query for highlighting movie titles. */
  searchQuery: string;
  /** Pre-fetched guesses for this assignment. */
  initialGuesses: any[];
  /** Pre-fetched audio message count for this assignment. */
  initialAudioMessageCount: number;
  /** Pre-fetched gambling points for this assignment. */
  initialGamblePoints: any[];
  episodeStatus: string;
}

/**
 * Renders the prediction UI for a single assignment.
 * Handles individual host rating selection, collapsible views, and submission logic.
 */

const AssignmentPrediction: FC<AssignmentPredictionProps> = ({
  assignment,
  hosts,
  ratings,
  userId,
  searchQuery,
  initialGuesses,
  initialAudioMessageCount,
  initialGamblePoints,
  episodeStatus,
}) => {
  const utils = api.useUtils();
  const [userExpanded, setUserExpanded] = useState(false);

  // These are now handled in the parent wrapper, but keeping them reactive if needed
  // by using the invalidated data from the cache.
  const { data: existingGuesses } =
    api.review.getUsersGuessesForAssignments.useQuery(
      { assignmentIds: [assignment.id], userId },
      { initialData: { [assignment.id]: initialGuesses } }
    );

  const { data: audioMessageCountData } =
    api.review.getUsersAudioMessagesCountForAssignments.useQuery(
      { assignmentIds: [assignment.id] },
      { initialData: { [assignment.id]: initialAudioMessageCount } }
    );

  const { data: gamblePointsData } =
    api.gambling.getUsersGamblingPointsForAssignments.useQuery(
      { assignmentIds: [assignment.id] },
      { initialData: { [assignment.id]: initialGamblePoints } }
    );

  const guesses = existingGuesses?.[assignment.id] ?? initialGuesses;
  const guessesForGambling = guesses.map((g) => ({
    hostId: g.assignmentReview.review.user.id,
    ratingId: g.rating.value,
  }));
  const audioMessageCount =
    audioMessageCountData?.[assignment.id] ?? initialAudioMessageCount;
  const gamblePoints = gamblePointsData?.[assignment.id] ?? initialGamblePoints;

  const gambleAmountForAssignment = gamblePoints.reduce(
    (acc: number, p: any) => acc + p.points,
    0
  );

  const submitGuess = api.review.submitGuess.useMutation({
    onMutate: async (newGuess) => {
      await utils.review.getUsersGuessesForAssignments.cancel({
        assignmentIds: [assignment.id],
        userId,
      });
      const previous = utils.review.getUsersGuessesForAssignments.getData({
        assignmentIds: [assignment.id],
        userId,
      });

      utils.review.getUsersGuessesForAssignments.setData(
        { assignmentIds: [assignment.id], userId },
        (old) => {
          const oldGuesses = old?.[assignment.id] ?? [];
          const filtered = oldGuesses.filter((g: any) => {
            const reviewUserId = g.AssignmentReview?.Review?.userId;
            const reviewUserObjId = g.AssignmentReview?.Review?.User?.id;
            return (reviewUserId ?? reviewUserObjId) !== newGuess.hostId;
          });

          const rating = ratings.find((r) => r.id === newGuess.ratingId);
          if (!rating) return old;

          const mockGuess = {
            id: "temp-id",
            ratingId: newGuess.ratingId,
            created: new Date(),
            userId: userId,
            assignmntReviewId: "temp-id",
            seasonId: "temp-id",
            pointsId: null,
            rating: rating,
            assignmentReview: {
              id: "temp-id",
              review: {
                id: "temp-id",
                userId: newGuess.hostId,
                movieId: null,
                ratingId: null,
                reviewedOn: null,
                showId: null,
                user: {
                  id: newGuess.hostId,
                  name: "Loading...",
                  email: "",
                  image: null,
                  emailVerified: null,
                  impersonatedUserId: null,
                },
              },
            },
          } as any; // Using 'any' for optimistic update temporary data

          return { ...old, [assignment.id]: [...filtered, mockGuess] };
        }
      );

      return { previous };
    },
    onError: (err, newGuess, context) => {
      console.error("Failed to submit guess:", err);
      utils.review.getUsersGuessesForAssignments.setData(
        { assignmentIds: [assignment.id], userId },
        context?.previous
      );
    },
    onSettled: () => {
      utils.review.getUsersGuessesForAssignments.invalidate();
      // Also invalidate the wrapper query
      utils.review.getUsersGuessesForAssignments.invalidate({
        assignmentIds: [assignment.id],
        userId,
      });
    },
  });

  const getGuessForHost = (hostId: string) => {
    if (!guesses) return null;

    return guesses.find((g: any) => {
      const reviewUserId = g.assignmentReview?.review?.userId;
      const reviewUserObjId = g.assignmentReview?.review?.user?.id;
      return (reviewUserId ?? reviewUserObjId) === hostId;
    });
  };

  /* These are pre-fetched */

  const hasAllGuesses =
    hosts.length > 0 && hosts.every((host) => !!getGuessForHost(host.id));
  const isCollapsed = !userExpanded;

  return (
    <div className="relative flex flex-col gap-4">
      {/* Collapsed Header View */}
      {isCollapsed ? (
        <div
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/40 p-2 transition-colors hover:bg-gray-800/60 sm:gap-4 sm:p-3"
          onClick={() => setUserExpanded(true)}
        >
          <span className="sm:text-md flex-grow pr-2 text-lg font-bold text-white">
            {assignment.movie
              ? highlightText(assignment.movie.title, searchQuery)
              : "Unknown Movie"}
          </span>

          <div className="flex items-center gap-3">
            <div className="mr-1 flex gap-1 sm:mr-2 sm:gap-2">
              {hosts.map((host) => {
                const guess = getGuessForHost(host.id);
                if (!guess) return null;
                return (
                  <div
                    key={host.id}
                    title={host.name ?? "Host"}
                    className="scale-75 opacity-90 transition-opacity hover:opacity-100 sm:scale-90"
                  >
                    <RatingIcon value={guess.rating.value} />
                  </div>
                );
              })}
            </div>
            {gambleAmountForAssignment > 0 && (
              <div className="flex items-center whitespace-nowrap rounded border border-purple-500/30 bg-purple-900/50 px-1.5 py-0.5 text-[10px] font-bold text-purple-200 sm:px-2 sm:py-1 sm:text-sm">
                {gambleAmountForAssignment}{" "}
                <Coins className="h-3 h-5 w-3 pl-0.5 sm:w-5 sm:pl-1" />
              </div>
            )}

            <Message assignmentId={assignment.id} userId={userId}>
              <div className="flex items-center whitespace-nowrap rounded border border-green-500/30 bg-green-900/50 px-1.5 py-0.5 text-[10px] font-bold text-green-200 sm:px-2 sm:py-1 sm:text-sm">
                {audioMessageCount ?? 0}{" "}
                <Voicemail className="h-3 h-5 w-3 pl-0.5 sm:w-5 sm:pl-1" />
              </div>
            </Message>

            <ChevronDown className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      ) : (
        <>
          {/* Expanded Header */}
          <div className="flex items-start justify-between">
            <h3 className="border-l-4 border-red-500 pl-2 text-xl font-bold text-white">
              {assignment.movie
                ? highlightText(assignment.movie.title, searchQuery)
                : "Unknown Movie"}
            </h3>
            {hasAllGuesses && (
              <button
                onClick={() => setUserExpanded(false)}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <ChevronUp className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid gap-3">
            {hosts.map((host) => {
              const guess = getGuessForHost(host.id);
              const isSubmitting =
                submitGuess.isLoading &&
                submitGuess.variables?.hostId === host.id;

              return (
                <div
                  key={host.id}
                  className="grid grid-cols-[100px_1fr] items-center gap-2 rounded-lg border border-gray-700/50 bg-gray-800/40 p-3 transition-colors hover:border-gray-600 sm:grid-cols-[120px_1fr] sm:gap-4"
                >
                  <div
                    className="w-full truncate text-sm font-medium text-gray-200 sm:text-base"
                    title={host.name ?? ""}
                  >
                    {host.name}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ratings.map((rating) => {
                      const isSelected = guess?.rating.id === rating.id;
                      return (
                        <button
                          type="button"
                          key={rating.id}
                          onClick={() => {
                            if (isSelected || isSubmitting) return;
                            submitGuess.mutate({
                              assignmentId: assignment.id,
                              hostId: host.id,
                              guesserId: userId,
                              ratingId: rating.id,
                            });
                          }}
                          disabled={isSubmitting}
                          className={cn(
                            "rounded-md border px-2 py-1 text-[10px] font-medium transition-all duration-200 sm:px-3 sm:py-1.5 sm:text-xs",
                            isSelected
                              ? "scale-105 border-red-500 text-white shadow-[0_0_10px_rgba(145,0,0,0.5)]"
                              : "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500 hover:bg-gray-600 hover:text-gray-200",
                            isSubmitting && "cursor-not-allowed opacity-50"
                          )}
                          title={rating.name}
                        >
                          <RatingIcon value={rating.value} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {hasAllGuesses && (
            <AssignmentGamblingBoard
              assignmentId={assignment.id}
              userId={userId}
              hosts={hosts}
              guesses={guessesForGambling}
              episodeStatus={episodeStatus}
            />
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-700/50 pt-4">
            <div className="flex w-full justify-center gap-4">
              <Call />
              <Message
                assignmentId={assignment.id}
                userId={userId}
                count={audioMessageCount}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Component to trigger a popover containing the phone number information.
 */
const Call = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <PhoneNumber />
          <PopoverClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Component to trigger a popover for recording and sending audio messages (voicemails).
 */
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
}) => {
  return (
    <Popover>
      <PopoverTrigger
        asChild
        onClick={(e) => (children ? e.stopPropagation() : undefined)}
      >
        {children ?? (
          <Button variant="outline" className="flex items-center gap-2">
            {count ?? 0} <Voicemail className="h-5 w-5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-gray-400">Got something to say?</span>
          <PopoverClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
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
};
