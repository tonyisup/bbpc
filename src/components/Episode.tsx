import { type FC } from "react";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import type { Episode as EpisodeType, Link as EpisodeLink, Movie, User, Review, ExtraReview, Show } from '@prisma/client';
import Link from "next/link";
import { AddExtraToNext } from "./AddExtraToNext";
import { highlightText } from "@/utils/text";
import ShowInlinePreview from "./ShowInlinePreview";
import { PredictionGame } from "./PredictionGame";
import { RouterOutputs } from "@/utils/trpc";

/**
 * Represents an episode with all its related assignments, extras, and links.
 */
export type CompleteEpisode = NonNullable<RouterOutputs['episode']['next']>;

// Helper type to extract assignments from the episode
type EpisodeAssignment = CompleteEpisode['assignments'][number];

/**
 * Props for the Episode component.
 */
interface EpisodeProps {
	/** Whether to allow the prediction game (guesses) for this episode. */
	allowGuesses?: boolean,
	/** Whether to explicitly show movie titles under the movie/show previews. */
	showMovieTitles?: boolean,
	/** Search query for highlighting relevant text within the episode details. */
	searchQuery?: string,
	/** The complete episode data. */
	episode: CompleteEpisode;
}

/**
 * Renders a full episode section, including the header (title, date, number), assignments, extras, and links.
 */

export const Episode: FC<EpisodeProps> = ({ episode, allowGuesses: isNextEpisode, showMovieTitles = false, searchQuery = "" }) => {
	if (!episode) return null;
	if (isNextEpisode == null) isNextEpisode = false;

	return <section className="px-2 bg-transparent outline-2 outline-gray-500 outline rounded-2xl flex flex-col gap-2 justify-between">
		<div className="">
			<div className="flex justify-between items-center gap-2 font-bold px-1 sm:justify-around sm:items-baseline">
				<div className="text-sm sm:text-md p-1 sm:p-2 whitespace-nowrap">
					<Link href={`/episodes/${episode.id}`}>
						{episode?.number}
					</Link>
				</div>
				<div className="text-lg sm:text-xl md:text-2xl p-2 flex-grow flex justify-center items-center text-center gap-2 leading-tight">
					{!episode?.recording && highlightText(episode?.title ?? "", searchQuery)}
					{episode?.recording && <a className="underline" title={episode?.title} href={episode.recording ?? ""} target="_blank" rel="noreferrer">
						{highlightText(episode?.title ?? "", searchQuery)}
					</a>}
				</div>
				<div className="text-sm sm:text-md p-1 sm:p-2 whitespace-nowrap">
					{episode?.date && <p>{new Date(episode.date).toLocaleDateString("en-us", { month: "2-digit", day: "2-digit", year: "2-digit" })}</p>}
				</div>
			</div>
			<div className="w-full text-center">
				<p>{highlightText(episode?.description ?? "", searchQuery)}</p>
			</div>
			<EpisodeAssignments assignments={episode.assignments} showMovieTitles={showMovieTitles} searchQuery={searchQuery} />
			{isNextEpisode && episode.assignments.filter(a => a.playable).length > 0 && <PredictionGame assignments={episode.assignments.filter(a => a.playable)} searchQuery={searchQuery} />}
		</div>
		<div>
			{episode.extras.length > 0 && (
				<>
					<hr className="my-2 border-gray-500" />
					<span className="text-xs">Extras</span>
					<EpisodeExtras extras={episode.extras} showMovieTitles={showMovieTitles} searchQuery={searchQuery} />
				</>
			)}
			{isNextEpisode && <AddExtraToNext episode={episode} />}
			<EpisodeLinks links={episode.links} />
		</div>
	</section>
}

/**
 * Props for the EpisodeAssignments component.
 */
interface EpisodeAssignments {
	showMovieTitles?: boolean,
	assignments: EpisodeAssignment[];
	searchQuery?: string;
}

/**
 * Renders a list of assignments for an episode, sorted by type (Homework -> Extra Credit -> Bonus).
 */

const EpisodeAssignments: FC<EpisodeAssignments> = ({ assignments, showMovieTitles = false, searchQuery = "" }) => {
	if (!assignments || assignments.length == 0) return null;
	return <div className="flex gap-2 justify-around">
		{assignments.sort((a, b) => {
			const typeOrder = { "HOMEWORK": 0, "EXTRA_CREDIT": 1, "BONUS": 2 };
			return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
		}).map((assignment) => {
			return <div key={assignment.id} className="flex flex-col items-center justify-between gap-2">
				<Assignment assignment={assignment} key={assignment.id} showMovieTitles={showMovieTitles} searchQuery={searchQuery} />
			</div>
		})}
	</div>
}

/**
 * Props for the EpisodeExtras component.
 */
interface EpisodeExtras {
	showMovieTitles?: boolean,
	searchQuery?: string,
	extras: (ExtraReview & {
		review: (Review & {
			user: User | null;
			movie: Movie | null;
			show: Show | null;
		})
	})[];
}

/**
 * Renders the "Extras" section for an episode, showing previews of additional movies or shows discussed.
 */

const EpisodeExtras: FC<EpisodeExtras> = ({ extras, showMovieTitles = false, searchQuery = "" }) => {
	if (!extras || extras.length == 0) return null;
	return <div className="py-2t">
		<div className="flex justify-center gap-2 flex-wrap pb-2">
			{extras.map((extra) => {
				return <div key={extra.id} className="flex items-center gap-2 w-12 sm:w-36">
					<div className="flex flex-col items-center gap-2">
						{extra.review.movie && <MovieInlinePreview movie={extra.review.movie} searchQuery={searchQuery} responsive />}
						{extra.review.show && <ShowInlinePreview show={extra.review.show} searchQuery={searchQuery} responsive />}
						{showMovieTitles && (
							<div className="text-sm text-gray-500">
								{highlightText(`${extra.review.movie?.title} (${extra.review.movie?.year})`, searchQuery)}
							</div>
						)}
					</div>
				</div>
			})}
		</div>
	</div>
}

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
	return <div className="mt-4 w-full">
		<div className="flex flex-col items-center justify-center gap-2 flex-wrap">
			{links.map((link) => {
				return <a key={link.id} href={link.url}>{link.text}</a>
			})}
		</div>
	</div>
}