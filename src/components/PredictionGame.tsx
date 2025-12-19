"use client";


import { type FC } from "react";
import { api } from "@/trpc/react";
import { type AssignmentWithRelations } from "@/types/assignment";
import { type User, type Rating } from "@prisma/client";
import { highlightText } from "@/utils/text";
import { cn } from "@/lib/utils";
import RatingIcon from "./RatingIcon";
import GamblingSection from "./GamblingSection";
import { SignInButton } from "./Auth";

interface PredictionGameProps {
	assignments: AssignmentWithRelations[];
	searchQuery?: string;
}

export const PredictionGame: FC<PredictionGameProps> = ({ assignments, searchQuery = "" }) => {
	const { data: session } = api.auth.getSession.useQuery();
	const { data: hosts } = api.user.hosts.useQuery();
	const { data: ratings } = api.movie.ratings.useQuery();

	if (!session?.user) return <div className="p-4 text-center text-gray-400">Please <SignInButton /> to play the game.</div>;
	if (!hosts || !ratings) return <div className="p-4 text-center text-gray-400">Loading prediction game...</div>;



	return (
		<div className="flex flex-col gap-8 p-6 border rounded-xl border-gray-700 mt-6 bg-gray-900/50 backdrop-blur-sm shadow-xl">
			<div className="flex flex-col gap-2 border-b border-gray-700 pb-4">
				<h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Prediction Game</h2>
				<p className="text-sm text-gray-400">Predict what rating each host will give to the movies!</p>
			</div>

			<div className="flex flex-col gap-10">
				{assignments.map((assignment) => (
					<AssignmentPrediction
						key={assignment.id}
						assignment={assignment}
						hosts={hosts}
						ratings={ratings}
						userId={session.user?.id ?? ""}
						searchQuery={searchQuery}
					/>
				))}
			</div>

			{/* Ability to gamble per assignment here */}
		</div>
	);
};

interface AssignmentPredictionProps {
	assignment: AssignmentWithRelations;
	hosts: User[];
	ratings: Rating[];
	userId: string;
	searchQuery: string;
}

const AssignmentPrediction: FC<AssignmentPredictionProps> = ({ assignment, hosts, ratings, userId, searchQuery }) => {
	const utils = api.useUtils();
	const { data: existingGuesses, isLoading } = api.review.getGuessesForAssignmentForUser.useQuery({
		assignmentId: assignment.id,
		userId: userId
	});

	const submitGuess = api.review.submitGuess.useMutation({
		onMutate: async (newGuess) => {
			await utils.review.getGuessesForAssignmentForUser.cancel({ assignmentId: assignment.id, userId });
			const previousGuesses = utils.review.getGuessesForAssignmentForUser.getData({ assignmentId: assignment.id, userId });

			utils.review.getGuessesForAssignmentForUser.setData({ assignmentId: assignment.id, userId }, (old) => {
				const oldGuesses = old ?? [];
				// Remove existing guess for this host
				const filtered = oldGuesses.filter(g => {
					// Check both User object and userId field for robustness
					const reviewUserId = g.AssignmentReview?.Review?.userId;
					const reviewUserObjId = g.AssignmentReview?.Review?.User?.id;
					const hostId = reviewUserId ?? reviewUserObjId;
					return hostId !== newGuess.hostId;
				});

				const rating = ratings.find(r => r.id === newGuess.ratingId);
				if (!rating) return [...filtered];

				// Create mock new guess
				const mockGuess = {
					id: "temp-id",
					ratingId: newGuess.ratingId,
					created: new Date(),
					userId: userId,
					assignmntReviewId: "temp-id",
					seasonId: "temp-id",
					pointsId: null,
					Rating: rating,
					AssignmentReview: {
						id: "temp-id",
						Review: {
							id: "temp-id",
							userId: newGuess.hostId,
							User: {
								id: newGuess.hostId,
								name: "Loading...",
								email: "",
								image: null
							}
						}
					}
				} as any;

				return [...filtered, mockGuess];
			});

			return { previousGuesses };
		},
		onError: (err, newGuess, context) => {
			console.error("Failed to submit guess:", err);
			utils.review.getGuessesForAssignmentForUser.setData({ assignmentId: assignment.id, userId }, context?.previousGuesses);
		},
		onSettled: () => {
			utils.review.getGuessesForAssignmentForUser.invalidate({ assignmentId: assignment.id, userId });
		}
	});

	const getGuessForHost = (hostId: string) => {
		if (!existingGuesses) return null;
		return existingGuesses.find(g => {
			const reviewUserId = g.AssignmentReview?.Review?.userId;
			const reviewUserObjId = g.AssignmentReview?.Review?.User?.id;
			return (reviewUserId ?? reviewUserObjId) === hostId;
		});
	};

	if (isLoading) return <div className="animate-pulse h-32 bg-gray-800/50 rounded-lg"></div>;

	return (
		<div className="flex flex-col gap-4">
			<h3 className="font-bold text-xl text-white pl-2 border-l-4 border-purple-500">
				{assignment.Movie ? highlightText(assignment.Movie.title, searchQuery) : "Unknown Movie"}
			</h3>

			<div className="grid gap-3">
				{hosts.map(host => {
					const guess = getGuessForHost(host.id);
					const isSubmitting = submitGuess.isLoading && submitGuess.variables?.hostId === host.id;

					return (
						<div key={host.id} className="grid grid-cols-[120px_1fr] items-center gap-4 bg-gray-800/40 p-3 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-colors">
							<div className="font-medium text-gray-200 truncate" title={host.name ?? ""}>
								{host.name}
							</div>
							<div className="flex flex-wrap gap-2">
								{ratings.map(rating => {
									const isSelected = guess?.Rating.id === rating.id;
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
												"px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border",
												isSelected
													? "bg-purple-600 border-purple-500 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)] scale-105"
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

			<div className="pt-4 border-t border-gray-700/50">
				<GamblingSection assignmentId={assignment.id} userId={userId} />
			</div>
		</div>
	);
}
