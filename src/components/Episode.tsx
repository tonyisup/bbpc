import { type FC } from "react";
import { HiExternalLink } from "react-icons/hi";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import type { Assignment as AssignmentType, Episode as EpisodeType, Link as EpisodeLink, Movie, User, Review, ExtraReview } from '@prisma/client';
import Link from "next/link";
import { AddExtraToNext } from "./AddExtraToNext";
import RatingIcon from "./RatingIcon";


interface EpisodeProps {
	allowGuesses?: boolean,
  episode: null | (EpisodeType & {
    assignments: (AssignmentType & {
        User: User;
        Movie: Movie | null;
    })[];
    extras: (ExtraReview & {
      Review: (Review & {
        User: User;
        Movie: Movie;
    })})[];
		links: EpisodeLink[];
	});
}

export const Episode: FC<EpisodeProps> = ({ episode, allowGuesses: isNextEpisode }) => {
	if (!episode) return null;
	if (isNextEpisode == null) isNextEpisode = false;

  return <section className="px-2 bg-transparent outline-2 outline-gray-500 outline rounded-2xl">
    <div className="">
      <div className="flex justify-around items-baseline gap-2 font-bold">
        <div className="text-md p-2">          
          {episode?.number}
        </div>
				<div className="text-2xl p-2 flex-grow flex justify-center items-center gap-2">
					{!episode?.recording && episode?.title}
					{episode?.recording && <a className="underline" title={episode?.title} href={episode.recording ?? ""} target="_blank" rel="noreferrer">
						{episode?.title}
					</a>}
				</div>
				<div className="text-md p-2">					
					{episode?.date && <p>{new Date(episode.date).toLocaleDateString("en-us", { month: "2-digit", day: "2-digit", year: "2-digit"})}</p>}
				</div>        
      </div>
			<div className="w-full text-center">
      	<p>{episode?.description}</p>
      </div>
      <EpisodeAssignments assignments={episode.assignments} allowGuesses={isNextEpisode} />
    </div>
    <EpisodeExtras extras={episode.extras} />		
		{isNextEpisode && <AddExtraToNext episode={episode} />}
		<EpisodeLinks links={episode.links} />
  </section>
}
interface EpisodeAssignments {
	allowGuesses?: boolean,
	assignments: (AssignmentType & {
		User: User;
		Movie: Movie | null;
	})[];
}
const EpisodeAssignments: FC<EpisodeAssignments> = ({ assignments, allowGuesses }) => {
	if (!assignments || assignments.length == 0) return null;
	return <div className="flex gap-2 justify-around">
		{assignments.sort((a,b) => a.homework && !b.homework ? -1 : a.homework && b.homework ? 0 : 1).map((assignment) => {
			return <div key={assignment.id} className="flex flex-col items-center justify-between gap-2">
				<Assignment assignment={assignment} key={assignment.id} />
				
				{allowGuesses && <Link className="bg-red-600 hover:bg-red-500 text-white py-1 px-4 text-2xl border-b-4 border-red-800 hover:border-red-600 rounded-xl" href={`/assignment/${assignment.id}`}>
					<div className="flex">
						GUESS
					</div>
				</Link>}
			</div>
		})}
	</div>
}

interface EpisodeExtras {
	extras: (ExtraReview & {
		Review: (Review & {
			User: User;
			Movie: Movie;
	})})[];
}

const EpisodeExtras: FC<EpisodeExtras> = ({ extras }) => {
	if (!extras || extras.length == 0) return null;
	return <div className="py-2 w-full">
		<div className="flex justify-center gap-2 flex-wrap">
			{extras.map((extra) => {
				return <div key={extra.id} className="flex items-center gap-2 w-20">
					{extra.Review.Movie && <MovieInlinePreview movie={extra.Review.Movie} />}
				</div>
			})}
		</div>
	</div>
}

interface EpisodeLinkProps {
	links: EpisodeLink[];
}
const EpisodeLinks: FC<EpisodeLinkProps> = ({ links }) => {
	if (!links || links.length == 0) return null;
	return <div className="mt-4 w-full">
			<div className="flex flex-col items-center justify-center gap-2 flex-wrap">
				{links.map((link) => {
					return <a key={link.id}  href={link.url}>{link.text}</a>
				})}
			</div>
	</div>
}