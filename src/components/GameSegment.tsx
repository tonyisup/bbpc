import { type Dispatch, type DispatchWithoutAction, type FC, useState, useEffect } from "react";
import { type Assignment, type Guess, type Rating, type User } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime/library";
import { trpc } from "../utils/trpc";
import { HiRefresh, HiUpload } from "react-icons/hi";
import AudioRecorder from "./common/AudioRecorder";
import UserTag from "./UserTag";
import RatingIcon from "./RatingIcon";
import { signIn } from "next-auth/react";
import PhoneNumber from "./common/PhoneNumber";
import { type Session } from "next-auth";

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

	const { data: session } = trpc.auth.getSession.useQuery();
	const [gameChoice, setGameChoice] = useState<GameChoice>(GameChoice.None);

	if (!session?.user?.id) return (
		<>
			<div className="flex flex-col items-center gap-4 m-4">
				<p className="text-2xl">Please <button
						type="button"
						title="Sign in"
						className="font-semibold text-red-600 no-underline transition hover:text-red-400"
						onClick={() => signIn()}
					>
						Sign in
					</button> to submit guesses
				</p>
			</div>
		</>
	);
	return <div className="flex flex-col gap-4 items-center py-4">
		<h3 className="text-2xl">Submit your guesses!</h3>
		<div className="flex gap-4 items-center">
			<div className="p-4 cursor-pointer bg-red-900 text-gray-300 rounded-md hover:bg-red-800" onClick={() => setGameChoice(GameChoice.PhoneMessage)}><span>Leave a phone message</span></div>
			<div className="p-4 cursor-pointer bg-red-900 text-gray-300 rounded-md hover:bg-red-800" onClick={() => setGameChoice(GameChoice.VoiceRecording)}><span>Leave a voice recording</span></div>
			<div className="p-4 cursor-pointer bg-red-900 text-gray-300 rounded-md hover:bg-red-800" onClick={() => setGameChoice(GameChoice.ClickButtons)}><span>Click some buttons</span></div>
		</div>
		{gameChoice == GameChoice.PhoneMessage && <PhoneNumber />}
		{gameChoice == GameChoice.VoiceRecording && <AudioRecorder userId={session.user.id} assignmentId={assignment.id} />}
    {gameChoice == GameChoice.ClickButtons && <GamePanel session={session} assignment={assignment} />}
	</div>
}
interface GamePanelProps {
    session: Session | null,
    assignment: Assignment
}
const GamePanel: FC<GamePanelProps> = ({ session, assignment }) => {
  
	const { data: guesses, refetch } = trpc.review.getGuessesForAssignmentForUser.useQuery(

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
		Rating: {
			id: string;
			name: string;
			value: number;
			sound: string | null;
			icon: string | null;
			category: string | null;
		};
		AssignmentReview: {
			Review: {
				User: {
					id: string;
					name: string | null;
					email: string | null;
					emailVerified: Date | null;
					image: string | null;
					points: Decimal | null;
				} | null;
			};
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
			<button className="cursor-pointer py-2 px-4 bg-red-900 text-gray-300 rounded-md disabled:bg-gray-500 disabled:text-gray-800"
				onClick={resetGuesses}
			>
				<HiRefresh className="inline-block m-2" />
				Redo Picks!
			</button>
		</div>
	)
}
interface SetAssignmentGuessesProps {
	assignment: Assignment,
	guesserId: string | undefined | null,
	guessesSaved: DispatchWithoutAction
}
const SetAssignmentGuesses: FC<SetAssignmentGuessesProps> = ({ assignment, guesserId, guessesSaved }) => {
	const { data: hosts } = trpc.user.hosts.useQuery();
	const [pendingGuesses, setPendingGuesses] = useState<Record<string, PendingGuess>>({});
	const [canSubmitGuesses, setCanSubmitGuesses] = useState<boolean>(false);
	const { mutate: submitGuess } = trpc.review.submitGuess.useMutation();

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
			<button disabled={!canSubmitGuesses} className="cursor-pointer py-2 px-4 bg-red-900 text-gray-300 rounded-md disabled:bg-gray-500 disabled:text-gray-800"
				onClick={handleSubmitGuesses}
			>
				<HiUpload className="inline-block m-2" />
				Submit Picks!
			</button>
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
	const { data: ratings } = trpc.review.getRatings.useQuery();

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
