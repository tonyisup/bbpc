import { type FC } from "react";
import { HiExternalLink } from "react-icons/hi";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import type { Assignment as AssignmentType, Episode as EpisodeType, Link as EpisodeLink, Movie, User, Review, ExtraReview } from '@prisma/client';
import Link from "next/link";


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

export const Episode: FC<EpisodeProps> = ({ episode, allowGuesses }) => {
	if (!episode) return null;
	if (allowGuesses == null) allowGuesses = false;

  return <section className="flex flex-col w-full mb-8">
    <div className="mt-4 w-full">
      <div className="flex w-full justify-center items-center gap-2">
        <h2 className="text-2xl font-bold">          
          {episode?.number} - {episode?.title}
        </h2>
        {episode?.recording && <a href={episode.recording ?? ""} target="_blank" rel="noreferrer">
          <HiExternalLink className="text-2xl" />
        </a>}
      </div>
			<div className="mt-4 w-full text-center">
				{episode?.date && <p>{new Date(episode.date).toLocaleDateString()}</p>}
      	<p>{episode?.description}</p>
      </div>
      <EpisodeAssignments assignments={episode.assignments} allowGuesses={allowGuesses} />
    </div>

    <EpisodeExtras extras={episode.extras} />
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
	return <div className="mt-4 w-full">
		<div className="w-full text-center"><h3>Assignments</h3></div>
		<div className="flex gap-2 justify-around">
			{assignments.sort((a,b) => a.homework && !b.homework ? -1 : a.homework && b.homework ? 0 : 1).map((assignment) => {
				return <div key={assignment.id} className="flex flex-col items-center justify-between gap-2">
					<Assignment assignment={assignment} key={assignment.id} />
					{allowGuesses && <Link className="p-4 bg-red-900 text-gray-300 rounded-md" href={`/assignment/${assignment.id}`}>Submit Guesses</Link>}
				</div>
			})}
		</div>
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
	return <div className="mt-4 w-full">
		<div className="w-full text-center"><h3>Extras</h3></div>
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
		<div className="w-full text-center"><h3>Links</h3></div>
			<div className="flex flex-col items-center justify-center gap-2 flex-wrap">
				{links.map((link) => {
					return <a key={link.id}  href={link.url}>{link.text}</a>
				})}
			</div>
	</div>
}