import { type FC } from "react";
import { type AssignmentWithRelations } from "@/types/assignment";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import type { Assignment as AssignmentType, Episode as EpisodeType, Link as EpisodeLink, Movie, User, Review, ExtraReview } from '@prisma/client';
import Link from "next/link";
import { AddExtraToNext } from "./AddExtraToNext";
import { highlightText } from "@/utils/text";
import { Button } from "./ui/button";

interface EpisodeProps {
	allowGuesses?: boolean,
	showMovieTitles?: boolean,
  searchQuery?: string,
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

export const Episode: FC<EpisodeProps> = ({ episode, allowGuesses: isNextEpisode, showMovieTitles = false, searchQuery = "" }) => {
	if (!episode) return null;
	if (isNextEpisode == null) isNextEpisode = false;

  return <section className="px-2 bg-transparent outline-2 outline-gray-500 outline rounded-2xl flex flex-col gap-2 justify-between">
    <div className="">
      <div className="flex justify-around items-baseline gap-2 font-bold">
        <div className="text-md p-2">  
					<Link href={`/episodes/${episode.id}`}>
						{episode?.number}
					</Link>
        </div>
				<div className="text-2xl p-2 flex-grow flex justify-center items-center gap-2">
					{!episode?.recording && highlightText(episode?.title ?? "", searchQuery)}
					{episode?.recording && <a className="underline" title={episode?.title} href={episode.recording ?? ""} target="_blank" rel="noreferrer">
						{highlightText(episode?.title ?? "", searchQuery)}
					</a>}
				</div>
				<div className="text-md p-2">					
					{episode?.date && <p>{new Date(episode.date).toLocaleDateString("en-us", { month: "2-digit", day: "2-digit", year: "2-digit"})}</p>}
				</div>        
      </div>
			<div className="w-full text-center">
      	<p>{highlightText(episode?.description ?? "", searchQuery)}</p>
      </div>
      <EpisodeAssignments assignments={episode.assignments} allowGuesses={isNextEpisode} showMovieTitles={showMovieTitles} searchQuery={searchQuery} />
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

interface EpisodeAssignments {
	allowGuesses?: boolean,
	showMovieTitles?: boolean,
	assignments: (AssignmentType & {
		User: User;
		Movie: Movie | null;
	})[];
	searchQuery?: string;
}

const EpisodeAssignments: FC<EpisodeAssignments> = ({ assignments, allowGuesses, showMovieTitles = false, searchQuery = "" }) => {
	if (!assignments || assignments.length == 0) return null;
	return <div className="flex gap-2 justify-around">
		{assignments.sort((a,b) => {
      const typeOrder = { "HOMEWORK": 0, "EXTRA_CREDIT": 1, "BONUS": 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    }).map((assignment) => {
			return <div key={assignment.id} className="flex flex-col items-center justify-between gap-2">
				<Assignment assignment={assignment} key={assignment.id} showMovieTitles={showMovieTitles} searchQuery={searchQuery} />
				
				{allowGuesses && 
					<Button variant="outline" asChild>
						<Link href={`/assignment/${assignment.id}`}>
							Play Game
						</Link>
					</Button>
				}
			</div>
		})}
	</div>
}

interface EpisodeExtras {
	showMovieTitles?: boolean,
	searchQuery?: string,
	extras: (ExtraReview & {
		Review: (Review & {
			User: User;
			Movie: Movie;
	})})[];
}

const EpisodeExtras: FC<EpisodeExtras> = ({ extras, showMovieTitles = false, searchQuery = "" }) => {
	if (!extras || extras.length == 0) return null;
	return <div className="py-2 w-full">
		<div className="flex justify-center gap-2 flex-wrap">
			{extras.map((extra) => {
				return <div key={extra.id} className="flex items-center gap-2 w-20">
					<div className="flex flex-col items-center gap-2">
						{extra.Review.Movie && <MovieInlinePreview movie={extra.Review.Movie} searchQuery={searchQuery} />}
						{showMovieTitles && (
							<div className="text-sm text-gray-500">
								{highlightText(`${extra.Review.Movie?.title} (${extra.Review.Movie?.year})`, searchQuery)}
							</div>
						)}
					</div>
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