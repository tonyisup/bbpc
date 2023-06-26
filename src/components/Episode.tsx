import { type FC } from "react";
import { HiExternalLink } from "react-icons/hi";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review } from '@prisma/client';


interface EpisodeProps {
  episode: (EpisodeType & {
    Assignment: (AssignmentType & {
        User: User;
        Movie: Movie | null;
    })[];
    Review: (Review & {
        User: User;
        Movie: Movie;
    })[];
	});
}

export const Episode: FC<EpisodeProps> = ({ episode }) => {
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
      	{episode?.description && <p>{episode.description}</p>}
      </div>
      {episode?.Assignment && episode.Assignment.length > 0 && <>
        <div className="mt-4 w-full text-center"><h3>Assignments</h3></div>
        <div className="flex gap-2 justify-around">
          {episode?.Assignment?.sort((a,b) => a.homework && !b.homework ? -1 : a.homework && b.homework ? 0 : 1).map((assignment) => {
            return <Assignment assignment={assignment} key={assignment.id} />
          })}
        </div>
      </>}
    </div>

    <div className="mt-4 w-full">
      {episode?.Review && episode.Review.length > 0 && <>
        <div className="w-full text-center"><h3>Extras</h3></div>
        <div className="flex justify-center gap-2 flex-wrap">
          {episode?.Review?.map((review) => {
            return <div key={review.id} className="flex items-center gap-2 w-20">
              {review.Movie && <MovieInlinePreview movie={review.Movie} />}
            </div>
          })}
        </div>
      </>}      
    </div>
  </section>
}