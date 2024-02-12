import { InferGetServerSidePropsType, NextPage } from "next";
import { ssr } from "../../server/db/ssr";
import Assignment from "../../components/Assignment";
import { AssignmentReview, Guess, Movie, Rating, Review, User } from "@prisma/client";
import { Dispatch, DispatchWithoutAction, FC, SetStateAction, useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";
import RatingIcon from "../../components/RatingIcon";
import UserTag from "../../components/UserTag";
import { HiBackspace, HiChevronLeft, HiRefresh, HiUpload } from "react-icons/hi";
import Link from "next/link";

export async function getServerSideProps({ params }: { params: { id: string } }) {
	const id = params.id;
	const assignment = await ssr.getAssignment(id);
	return {
		props: {
			assignment: JSON.parse(JSON.stringify(assignment))
		}
	}
}

const AssignmentPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ assignment }) => {
	
	const { data: session } = trpc.auth.getSession.useQuery();

	const { data: guesses, refetch } = trpc.review.getGuessesForAssignmentForUser.useQuery(
		{ assignmentId: assignment.id, userId: session?.user?.id }
	);

	const [ setGuesses, setSetGuesses ] = useState<boolean>(false);

	const handleResubmitGuesses = function() {
		setSetGuesses(true);
	}

	const handleSavedGuesses = function() {
		setSetGuesses(false);
		refetch();
	}

	
	if (!assignment) return null;
	
	if (!session?.user?.id) return (
		<>
			<Assignment assignment={assignment} />
			<div className="flex flex-col items-center gap-4">
				<h2 className="text-2xl">Please sign in to submit guesses</h2>
			</div>
		</>
	);

	return (
		<div>
			<div className="flex flex-col m-4 p-4 text-2xl items-center">
				<Link href="/">
					<HiChevronLeft className="inline-block m-2" />
					Back
				</Link>
				<Assignment assignment={assignment} />
			</div>
			{session && guesses?.length && <ShowAssignmentGuesses guesses={guesses} resetGuesses={handleResubmitGuesses} />}
			{session && (guesses?.length == 0 || setGuesses) && <SetAssignmentGuesses assignment={assignment} guesserId={session?.user?.id} guessesSaved={handleSavedGuesses} />}
		</div>
	)
}
interface ShowAssignmentGuessesProps {
	guesses: (Guess & {
    Rating: Rating;
    AssignmentReview: AssignmentReview & {
        Review: Review & {
            User: User;
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
			<button className="py-2 px-4 bg-blue-500 text-white rounded-md disabled:bg-gray-500 disabled:text-gray-800"
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

	const handleSetGuess = function(guess: PendingGuess) {
		if (!guess) return;
		if (!guess.host) return;
		if (guess.host == null) return;
		const host = guess.host;
		setPendingGuesses(prevGuesses => ({...prevGuesses, [host.id]: guess}));
}
	useEffect(() => {
		if (!hosts) return;
		setCanSubmitGuesses(Object.keys(pendingGuesses).length == hosts.length);
	}, [pendingGuesses]);
	
	const handleSubmitGuesses = function() 
	{
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
			<h2 className="text-2xl">Guesses</h2>
			<p>Pick your guess for the rating for each host</p>
			{hosts && hosts.map((host) => {
				return <div key={host.id} className="flex items-center">
					<GuessSelect host={host} setGuess={handleSetGuess} />
				</div>
			})}
			<button disabled={!canSubmitGuesses} className="py-2 px-4 bg-blue-500 text-white rounded-md disabled:bg-gray-500 disabled:text-gray-800"
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
	return <div  className="flex items-center gap-2">
		<UserTag user={host} />
		<RatingIcon value={rating?.value} />
		<span>{rating?.name}</span>
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
	const [guessedRating, setGuessedRating] = useState<Rating | null>(null);

	const handleRatingSelection = function(rating: Rating) {
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

	const isSelectedByValue = function(value: number) {
			return ratingValue == value;
	}
	const handleRatingSelection: Dispatch<number> = function(value: number) {
			setRatingValue(value);
			if (!ratings) return;
			const selectedRating = ratings.find(rating => rating.value == value);
			if (!selectedRating) return;
			selectRating(selectedRating);
	}
	
	if (!ratings) return null;
	return (
		<div className="ml-2 flex gap-2">			
			{ratings.sort((a,b) => a.value - b.value).map((rating) => {
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
		return <button className="p-4 text-2xl rounded-sm ring-2 hover:ring-2">
			<RatingIcon value={value} />
		</button>
	}
	const handleClick = function() {
		click(value);
	}
	return <button className="p-4 text-2xl rounded-sm hover:ring-2" onClick={handleClick}>
		<RatingIcon value={value} />
	</button>
}
export default AssignmentPage;