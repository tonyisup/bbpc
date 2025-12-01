'use client'
import { type Dispatch, type DispatchWithoutAction, type FC, useState, useEffect } from "react";
import { AssignmentReview, Review, type Assignment, type Guess, type Rating, type User } from "@prisma/client";

import { HiRefresh, HiUpload, HiPhone, HiMicrophone } from "react-icons/hi";
import RecordAssignmentAudio from "./common/RecordAssignmentAudio";
import UserTag from "./UserTag";
import RatingIcon from "./RatingIcon";
import PhoneNumber from "./common/PhoneNumber";
import { type Session } from "next-auth";
import { SignInButton } from "./Auth";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UserPoints from "./UserPoints";
import { GamepadIcon, UndoIcon } from "lucide-react";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface GameSegmentProps {
	assignment: Assignment
}
enum GameChoice {
	None = "none",
	PhoneMessage = "phone-message",
	VoiceRecording = "voice-recording",
	ClickButtons = "click-buttons"
}
const GameSegment: FC<GameSegmentProps> = ({ assignment }) => {
	const { data: session, status } = useSession();
	const [gameChoice, setGameChoice] = useState<GameChoice>(GameChoice.None);
	const [gamblingPoints, setGamblingPoints] = useState<number>(0);
	const [canSubmitGamblingPoints, setCanSubmitGamblingPoints] = useState<boolean>(false);

	// Fetch user data from the database
	const { data: userData } = api.user.me.useQuery(undefined, {
		enabled: !!session?.user?.email,
	});

	const { data: userPoints } = api.user.points.useQuery(undefined, {
		enabled: !!session?.user?.email,
	});

	// Fetch gambling points for this assignment
	const { data: assignmentGamblingPoints, refetch: refetchAssignmentGamblingPoints } = api.review.getGamblingPointsForAssignment.useQuery(
		{ assignmentId: assignment.id },
		{ enabled: !!session?.user?.email }
	);

	const { mutate: submitGamblingPoints } = api.review.submitGamblingPoints.useMutation({
		onSuccess: () => {
			refetchAssignmentGamblingPoints();
		},
		onError: (error) => {
			alert(`Error submitting gambling points: ${error.message}`);
		}
	});

	const handleGamblingPointsSubmit = () => {
		if (!session?.user?.id) return;
		if (!gamblingPoints) return;

		if (isNaN(gamblingPoints) || gamblingPoints < 0) {
			alert("Please enter a valid number of points");
			return;
		}

		submitGamblingPoints({
			userId: session.user.id,
			assignmentId: assignment.id,
			points: gamblingPoints
		});
	};

	useEffect(() => {
		const evalCanSubmitGamblingPoints = () => {
			// Check if user has points
			if (!userPoints) return false;

			if (Number(userPoints) <= 0) return false;

			// Check if gambling points input is valid
			if (isNaN(gamblingPoints) || gamblingPoints <= 0) return false;

			if (gamblingPoints > Number(userPoints)) return false;

			return true;
		}

		setCanSubmitGamblingPoints(evalCanSubmitGamblingPoints());
	}, [userPoints, gamblingPoints]);

	const handleAutoBet = (amount: number) => {
		setGamblingPoints(amount);
	}

	if (status === "loading") {
		return <div className="flex flex-col items-center gap-4 m-4">
			<p className="text-2xl animate-pulse">Loading...</p>
		</div>;
	}

	console.log('user data', userData);

	if (!userData?.id) return (
		<>
			<div className="flex flex-col items-center gap-4 m-4">
				<p className="text-2xl">Please <SignInButton /> to submit guesses tests</p>
			</div>
		</>
	);

	return <div className="flex flex-col gap-4 items-center py-4">
		{userPoints && Number(userPoints) > 0.0 && <div className="flex flex-col gap-2 items-center">
			<UserPoints points={Number(userPoints)} showSpendButton={false} />
			{assignmentGamblingPoints && assignmentGamblingPoints.length > 0 && assignmentGamblingPoints[0] && assignmentGamblingPoints[0].points > 0 && (
				<div className="flex gap-2 items-center">
					<p>You have gambled {assignmentGamblingPoints[0].points} points on this assignment!</p>
					<Button
						variant="destructive"
						size="icon"
						onClick={() => {
							if (!userData.id) return;
							submitGamblingPoints({
								userId: userData.id,
								assignmentId: assignment.id,
								points: 0
							});
						}}
					>
						<UndoIcon className="inline-block m-2" />
					</Button>
				</div>
			)}
			<div className="flex gap-2">
				<div className="flex flex-col gap-2">
					<div className="flex gap-2 items-center">
						<Label>Wanna bet?</Label>
						{userPoints && Number(userPoints) > 0 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(1)}>Bet 1</Badge>}
						{userPoints && Number(userPoints) > 5 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(5)}>Bet 5</Badge>}
						{userPoints && Number(userPoints) > 10 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(10)}>Bet 10</Badge>}
						{userPoints && Number(userPoints) > 20 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(20)}>Bet 20</Badge>}
						{userPoints && Number(userPoints) > 50 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(50)}>Bet 50</Badge>}
						{userPoints && Number(userPoints) > 0 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(Number(userPoints))}>ALL IN</Badge>}
					</div>
					<div className="flex gap-2">
						<Input
							type="number"
							placeholder="Points here..."
							value={gamblingPoints}
							onChange={(e) => setGamblingPoints(Number(e.target.value))}
						/>
						<Button
							disabled={!canSubmitGamblingPoints}
							className="text-gray-300 rounded-md hover:bg-red-800 bg-gradient-to-r from-blue-900 to-blue-500  relative overflow-hidden group"
							onClick={handleGamblingPointsSubmit}
						>
							<span className="absolute inset-0 bg-gradient-to-r from-transparent "></span>
							<span className="p-4 relative z-10 flex items-center">
								<span className="mr-1">Gamble!</span>
								<span className="animate-bounce inline-block">✨</span>
							</span>
						</Button>
					</div>
				</div>
			</div>
		</div>}
		<h3 className="text-2xl">Submit your guesses!</h3>
		<div className="flex flex-col md:flex-row gap-4 items-center">
			<Button
				variant="outline"
				onClick={() => setGameChoice(GameChoice.PhoneMessage)}
			>
				Leave a phone message
				<HiPhone className="inline-block m-2" />
			</Button>
			<Button
				variant="outline"
				onClick={() => setGameChoice(GameChoice.VoiceRecording)}
			>
				Leave a voice recording
				<HiMicrophone className="inline-block m-2" />
			</Button>
			<Button
				variant="outline"
				onClick={() => setGameChoice(GameChoice.ClickButtons)}
			>
				Click some buttons
				<GamepadIcon className="inline-block m-2" />
			</Button>
		</div>
		{gameChoice == GameChoice.PhoneMessage && <PhoneNumber />}
		{gameChoice == GameChoice.VoiceRecording && <RecordAssignmentAudio userId={userData?.id} assignmentId={assignment.id} />}
		{gameChoice == GameChoice.ClickButtons && <GamePanel session={session} assignment={assignment} />}
	</div>
}
interface GamePanelProps {
	session: Session | null,
	assignment: Assignment
}
const GamePanel: FC<GamePanelProps> = ({ session, assignment }) => {

	const { data: guesses, refetch } = api.review.getGuessesForAssignmentForUser.useQuery(

		{ assignmentId: assignment.id, userId: session?.user?.id }
	);

	const [setGuesses, setSetGuesses] = useState<boolean>(false);

	const handleResubmitGuesses = function () {
		setSetGuesses(true);
	}

	const handleSavedGuesses = function () {
		setSetGuesses(false);
		refetch();
	}

	return <>
		{session && (guesses?.length != undefined && guesses.length > 0) && <ShowAssignmentGuesses guesses={guesses} resetGuesses={handleResubmitGuesses} />}
		{session && (guesses?.length == 0 || setGuesses) && <SetAssignmentGuesses assignment={assignment} guesserId={session?.user?.id} guessesSaved={handleSavedGuesses} />}
	</>
}
interface ShowAssignmentGuessesProps {
	guesses: (Guess & {
		Rating: Rating;
		AssignmentReview: AssignmentReview & {
			Review: Review & {
				User: User | null;
			} | null;
		};
	})[] | null | undefined,
	resetGuesses: DispatchWithoutAction
}
const ShowAssignmentGuesses: FC<ShowAssignmentGuessesProps> = ({ guesses, resetGuesses }) => {
	return (
		<div className="flex flex-col gap-4 items-center py-4">
			<h2 className="text-2xl">Saved Guesses</h2>
			{guesses && guesses.map((guess) => {
				return <SelectedGuess key={guess.id} host={guess?.AssignmentReview?.Review?.User} rating={guess?.Rating} />
			})}
			<Button
				variant="outline"
				onClick={resetGuesses}
			>
				<HiRefresh className="inline-block m-2" />
				Redo Picks!
			</Button>
		</div>
	)
}
interface SetAssignmentGuessesProps {
	assignment: Assignment,
	guesserId: string | undefined | null,
	guessesSaved: DispatchWithoutAction
}
const SetAssignmentGuesses: FC<SetAssignmentGuessesProps> = ({ assignment, guesserId, guessesSaved }) => {
	const { data: hosts } = api.user.hosts.useQuery();
	const [pendingGuesses, setPendingGuesses] = useState<Record<string, PendingGuess>>({});
	const [canSubmitGuesses, setCanSubmitGuesses] = useState<boolean>(false);
	const { mutate: submitGuess } = api.review.submitGuess.useMutation();

	const handleSetGuess = function (guess: PendingGuess) {
		if (!guess) return;
		if (!guess.host) return;
		if (guess.host == null) return;
		const host = guess.host;
		setPendingGuesses(prevGuesses => ({ ...prevGuesses, [host.id]: guess }));
	}
	useEffect(() => {
		if (!hosts) return;
		setCanSubmitGuesses(Object.keys(pendingGuesses).length == hosts.length);
	}, [hosts, pendingGuesses]);

	const handleSubmitGuesses = function () {
		if (!pendingGuesses) return;

		Object.keys(pendingGuesses).forEach(key => {
			const guess = pendingGuesses[key];
			if (!guess) return;
			if (!guess.host) return;
			if (!guess.rating) return;
			if (!guesserId) return;
			submitGuess({
				assignmentId: assignment.id,
				guesserId: guesserId,
				hostId: guess.host.id,
				ratingId: guess.rating.id,
			}, { onSuccess: guessesSaved })
		})

	}

	if (!hosts) return null;
	if (!guesserId) return null;
	return (
		<div className="flex flex-col gap-4 items-center py-4">
			<p>Pick your guess for the rating for each host</p>
			{hosts && hosts.map((host) => {
				return <div key={host.id} className="flex items-center">
					<GuessSelect host={host} setGuess={handleSetGuess} />
				</div>
			})}
			<Button
				variant="outline"
				disabled={!canSubmitGuesses}
				onClick={handleSubmitGuesses}
			>
				<HiUpload className="inline-block m-2" />
				Submit Picks!
			</Button>
			{pendingGuesses && Object.keys(pendingGuesses).map((key) => {
				const guess = pendingGuesses[key];
				return <SelectedGuess key={key} host={guess?.host} rating={guess?.rating} />
			})}
		</div>
	)
}
interface SelectedGuessProps {
	host: User | null | undefined,
	rating: Rating | null | undefined
}
const SelectedGuess: FC<SelectedGuessProps> = ({ host, rating }) => {
	if (!host) return null;
	return <div className="flex items-center gap-2">
		<UserTag user={host} />
		<span className="cursor-pointer"><RatingIcon value={rating?.value} /></span>
		<span>{rating?.name} - {rating?.category}</span>
	</div>
}
class PendingGuess {
	host: User | null = null;
	rating: Rating | null = null;
}
interface GuessSelectProps {
	host: User,
	setGuess: Dispatch<PendingGuess>
}
const GuessSelect: FC<GuessSelectProps> = ({ host, setGuess }) => {
	const [, setGuessedRating] = useState<Rating | null>(null);

	const handleRatingSelection = function (rating: Rating) {
		setGuessedRating(rating);
		setGuess({ host, rating });
	}
	return (
		<div className="flex gap-2">
			<UserTag user={host} />
			<RatingSelect selectRating={handleRatingSelection} />
		</div>
	)
}
interface RatingSelectProps {
	selectRating: Dispatch<Rating>
}
const RatingSelect: FC<RatingSelectProps> = ({ selectRating }) => {
	const { data: ratings } = api.review.getRatings.useQuery();

	const [ratingValue, setRatingValue] = useState<number>(0);

	const isSelectedByValue = function (value: number) {
		return ratingValue == value;
	}
	const handleRatingSelection: Dispatch<number> = function (value: number) {
		setRatingValue(value);
		if (!ratings) return;
		const selectedRating = ratings.find(rating => rating.value == value);
		if (!selectedRating) return;
		selectRating(selectedRating);
	}

	if (!ratings) return null;
	return (
		<div className="ml-2 flex gap-2">
			{ratings.sort((a, b) => a.value - b.value).map((rating) => {
				return <RatingButton
					key={rating.id}
					value={rating.value}
					selected={isSelectedByValue(rating.value)}
					click={handleRatingSelection}
				/>
			})}
		</div>
	)
}
interface RatingButtonProps {
	value: number,
	selected?: boolean,
	click: Dispatch<number>
}
const RatingButton: FC<RatingButtonProps> = ({ value, selected, click }) => {
	if (selected) {
		return <div className="cursor-pointer p-4 text-2xl rounded-sm ring-red-900 ring-2 hover:ring-2">
			<RatingIcon value={value} />
		</div>
	}
	const handleClick = function () {
		click(value);
	}
	return <div className="cursor-pointer p-4 text-2xl rounded-sm ring-red-900 hover:ring-2" onClick={handleClick}>
		<RatingIcon value={value} />
	</div>
}
export default GameSegment;
