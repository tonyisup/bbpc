"use client";


import { type FC, useState, type ReactNode } from "react";
import { api } from "@/trpc/react";
import { type AssignmentWithRelations } from "@/types/assignment";
import { type User, type Rating } from "@prisma/client";
import { highlightText } from "@/utils/text";
import { cn } from "@/lib/utils";
import RatingIcon from "./RatingIcon";
import { SignInButton } from "./Auth";
import { ChevronDown, ChevronUp, Coins, Phone, Voicemail, X } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "./ui/popover";
import PhoneNumber from "./common/PhoneNumber";
import RecordAssignmentAudio from "./common/RecordAssignmentAudio";
import { useFeatureFlagEnabled } from 'posthog-js/react'
import UserTag from "./UserTag";
import AssignmentGamblingBoard from "./AssignmentGamblingBoard";
import { RouterOutputs } from "@/utils/trpc";

type episodetype = NonNullable<RouterOutputs['episode']['next']>;

// Helper type to extract assignments from the episode
type EpisodeAssignment = episodetype['assignments'][number];
/**
 * Props for the PredictionGame component.
 */
interface PredictionGameProps {
	/** Array of assignments with their related data (Episode, Movie, etc.). */
	assignments: EpisodeAssignment[];
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

export const PredictionGame: FC<PredictionGameProps> = ({ assignments, searchQuery = "", episodeStatus }) => {
	const { data: session } = api.auth.getSession.useQuery();
	const { data: hosts } = api.user.hosts.useQuery();
	const { data: ratings } = api.movie.ratings.useQuery();
	const [isAdminCollapsed, setIsAdminCollapsed] = useState(true);
	const flagEnabled = useFeatureFlagEnabled('new-season-format')

	if (!session?.user) return <div className="p-4 text-center text-gray-400">Please <SignInButton /> to play the game.</div>;
	if (!hosts || !ratings) return <div className="p-4 text-center text-gray-400">Loading prediction game...</div>;
	const isAdmin = session.user.isAdmin;

	return (
		<div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 border rounded-xl border-gray-700 mt-6 bg-gray-900/50 backdrop-blur-sm shadow-xl">
			<div
				className={cn(
					"flex flex-col gap-2 pb-4",
					isAdmin ? "cursor-pointer select-none" : "border-b border-gray-700"
				)}
				onClick={() => isAdmin && setIsAdminCollapsed(!isAdminCollapsed)}
			>
				<div className="flex items-center justify-between">
					<div className="flex flex-col gap-1">
						<h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-red-600">Prediction Game</h2>
						{(!isAdmin || !isAdminCollapsed) && (
							<p className="text-xs sm:text-sm text-gray-400">Predict what rating each host will give to the movies!</p>
						)}
					</div>
					{isAdmin && (
						<div className="flex items-center gap-2">
							<span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Admin</span>
							{isAdminCollapsed ? <ChevronDown className="text-gray-400 w-5 h-5" /> : <ChevronUp className="text-gray-400 w-5 h-5" />}
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
	assignments: EpisodeAssignment[];
	hosts: User[];
	ratings: Rating[];
	userId: string;
	searchQuery: string;
	episodeStatus: string;
}> = ({ assignments, hosts, ratings, userId, searchQuery, episodeStatus }) => {
	const assignmentIds = assignments.map(a => a.id);

	const { data: allGuesses, isLoading: isLoadingGuesses } = api.review.getUsersGuessesForAssignments.useQuery({
		assignmentIds,
		userId
	});


	const { data: allAudioMessageCounts, isLoading: isLoadingAudio } = api.review.getUsersAudioMessagesCountForAssignments.useQuery({
		assignmentIds
	});

	const { data: allGamblePoints, isLoading: isLoadingGambling } = api.gambling.getUsersGamblingPointsForAssignments.useQuery({
		assignmentIds
	});

	if (isLoadingGuesses || isLoadingAudio || isLoadingGambling) {
		return <div className="animate-pulse h-64 bg-gray-800/50 rounded-lg"></div>;
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
	assignment: EpisodeAssignment;
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
	episodeStatus
}) => {
	const utils = api.useUtils();
	const [userExpanded, setUserExpanded] = useState(false);

	// These are now handled in the parent wrapper, but keeping them reactive if needed
	// by using the invalidated data from the cache.
	const { data: existingGuesses } = api.review.getUsersGuessesForAssignments.useQuery(
		{ assignmentIds: [assignment.id], userId },
		{ initialData: { [assignment.id]: initialGuesses } }
	);

	const { data: audioMessageCountData } = api.review.getUsersAudioMessagesCountForAssignments.useQuery(
		{ assignmentIds: [assignment.id] },
		{ initialData: { [assignment.id]: initialAudioMessageCount } }
	);

	const { data: gamblePointsData } = api.gambling.getUsersGamblingPointsForAssignments.useQuery(
		{ assignmentIds: [assignment.id] },
		{ initialData: { [assignment.id]: initialGamblePoints } }
	);

	const guesses = existingGuesses?.[assignment.id] ?? initialGuesses;
	const guessesForGambling = guesses.map(g => ({ hostId: g.assignmentReview.review.user.id, ratingId: g.rating.value }));
	const audioMessageCount = audioMessageCountData?.[assignment.id] ?? initialAudioMessageCount;
	const gamblePoints = gamblePointsData?.[assignment.id] ?? initialGamblePoints;

	const gambleAmountForAssignment = gamblePoints.reduce((acc: number, p: any) => acc + p.points, 0);

	const submitGuess = api.review.submitGuess.useMutation({
		onMutate: async (newGuess) => {
			await utils.review.getUsersGuessesForAssignments.cancel({ assignmentIds: [assignment.id], userId });
			const previous = utils.review.getUsersGuessesForAssignments.getData({ assignmentIds: [assignment.id], userId });

			utils.review.getUsersGuessesForAssignments.setData({ assignmentIds: [assignment.id], userId }, (old) => {
				const oldGuesses = old?.[assignment.id] ?? [];
				const filtered = oldGuesses.filter((g: any) => {
					const reviewUserId = g.AssignmentReview?.Review?.userId;
					const reviewUserObjId = g.AssignmentReview?.Review?.User?.id;
					return (reviewUserId ?? reviewUserObjId) !== newGuess.hostId;
				});

				const rating = ratings.find(r => r.id === newGuess.ratingId);
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
							ReviewdOn: null,
							showId: null,
							user: {
								id: newGuess.hostId,
								name: "Loading...",
								email: "",
								image: null,
								emailVerified: null,
								impersonatedUserId: null
							}
						}
					}
				} as any; // Using 'any' for optimistic update temporary data

				return { ...old, [assignment.id]: [...filtered, mockGuess] };
			});

			return { previous };
		},
		onError: (err, newGuess, context) => {
			console.error("Failed to submit guess:", err);
			utils.review.getUsersGuessesForAssignments.setData({ assignmentIds: [assignment.id], userId }, context?.previous);
		},
		onSettled: () => {
			utils.review.getUsersGuessesForAssignments.invalidate();
			// Also invalidate the wrapper query
			utils.review.getUsersGuessesForAssignments.invalidate({ assignmentIds: [assignment.id], userId });
		}
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

	const hasAllGuesses = hosts.length > 0 && hosts.every(host => !!getGuessForHost(host.id));
	const isCollapsed = !userExpanded;

	return (
		<div className="flex flex-col gap-4 relative">
			{/* Collapsed Header View */}
			{isCollapsed ? (
				<div
					className="flex items-center gap-2 sm:gap-4 bg-gray-800/40 p-2 sm:p-3 rounded-lg border border-gray-700/50 cursor-pointer hover:bg-gray-800/60 transition-colors"
					onClick={() => setUserExpanded(true)}
				>
					<span className="font-bold text-lg sm:text-md text-white flex-grow pr-2">
						{assignment.movie ? highlightText(assignment.movie.title, searchQuery) : "Unknown Movie"}
					</span>

					<div className="flex gap-3 items-center">
						<div className="flex gap-1 sm:gap-2 mr-1 sm:mr-2">
							{hosts.map(host => {
								const guess = getGuessForHost(host.id);
								if (!guess) return null;
								return (
									<div key={host.id} title={host.name ?? "Host"} className="scale-75 sm:scale-90 opacity-90 hover:opacity-100 transition-opacity">
										<RatingIcon value={guess.rating.value} />
									</div>
								);
							})}
						</div>
						{gambleAmountForAssignment > 0 && (
							<div className="flex items-center bg-purple-900/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-purple-200 font-bold text-[10px] sm:text-sm border border-purple-500/30 whitespace-nowrap">
								{gambleAmountForAssignment} <Coins className="pl-0.5 sm:pl-1 w-3 h-3 sm:w-5 h-5" />
							</div>
						)}



						<Message assignmentId={assignment.id} userId={userId}>
							<div className="flex items-center bg-green-900/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-green-200 font-bold text-[10px] sm:text-sm border border-green-500/30 whitespace-nowrap">
								{audioMessageCount ?? 0} <Voicemail className="pl-0.5 sm:pl-1 w-3 h-3 sm:w-5 h-5" />
							</div>
						</Message>

						<ChevronDown className="text-gray-400 w-5 h-5" />
					</div>
				</div>
			) : (
				<>
					{/* Expanded Header */}
					<div className="flex justify-between items-start">
						<h3 className="font-bold text-xl text-white pl-2 border-l-4 border-red-500">
							{assignment.movie ? highlightText(assignment.movie.title, searchQuery) : "Unknown Movie"}
						</h3>
						{hasAllGuesses && (
							<button
								onClick={() => setUserExpanded(false)}
								className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
							>
								<ChevronUp className="w-5 h-5" />
							</button>
						)}
					</div>

					<div className="grid gap-3">
						{hosts.map(host => {
							const guess = getGuessForHost(host.id);
							const isSubmitting = submitGuess.isLoading && submitGuess.variables?.hostId === host.id;

							return (
								<div key={host.id} className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] items-center gap-2 sm:gap-4 bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
									<div className="font-medium text-sm sm:text-base text-gray-200 truncate w-full" title={host.name ?? ""}>
										{host.name}
									</div>
									<div className="flex flex-wrap gap-2">
										{ratings.map(rating => {
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
															ratingId: rating.id
														});
													}}
													disabled={isSubmitting}
													className={cn(
														"px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-200 border",
														isSelected
															? "border-red-500 text-white shadow-[0_0_10px_rgba(145,0,0,0.5)] scale-105"
															: "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-gray-200 hover:border-gray-500",
														isSubmitting && "opacity-50 cursor-not-allowed"
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

					{hasAllGuesses && <AssignmentGamblingBoard
						assignmentId={assignment.id}
						userId={userId}
						hosts={hosts}
						guesses={guessesForGambling}
						episodeStatus={episodeStatus}
					/>}
					<div className="flex gap-4 flex-wrap items-center justify-between pt-4 border-t border-gray-700/50">
						<div className="flex w-full justify-center gap-4">
							<Call />
							<Message assignmentId={assignment.id} userId={userId} count={audioMessageCount} />
						</div>
					</div>
				</>
			)}
		</div>
	);
}

/**
 * Component to trigger a popover containing the phone number information.
 */
const Call = () => {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" className="flex items-center gap-2"><Phone className="w-5 h-5" /></Button>
			</PopoverTrigger>
			<PopoverContent onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center">
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
}

/**
 * Component to trigger a popover for recording and sending audio messages (voicemails).
 */
const Message = ({ assignmentId, userId, count, children }: { assignmentId: string; userId: string; count?: number; children?: ReactNode }) => {
	return (
		<Popover>
			<PopoverTrigger asChild onClick={(e) => children ? e.stopPropagation() : undefined}>
				{children ?? (
					<Button variant="outline" className="flex items-center gap-2">
						{count ?? 0} <Voicemail className="w-5 h-5" />
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className="w-[calc(100vw-2rem)] sm:w-96" onClick={(e) => e.stopPropagation()}>
				<div className="flex justify-between items-center mb-2">
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
}
