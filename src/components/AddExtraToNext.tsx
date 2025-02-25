'use client';

import { type FC, useState } from "react";
import AddEpisodeExtraModal from "./AddEpisodeExtraModal";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review, ExtraReview, Link as EpisodeLink } from '@prisma/client';
import { api } from "@/trpc/react";
import MovieInlinePreview from "./MovieInlinePreview";

interface AddExtraToNextProps {
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
export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {  

	const { data: isAdmin } = api.auth.isAdmin.useQuery();
  const [addedExtras, setAddedExtras] = useState<Movie[]>([]);
  
  const addExtra = (movie: Movie) => {
    setAddedExtras([...addedExtras, movie]);
  }
	
	if (!episode) return null;
  return (
    <>
      {addedExtras && addedExtras.length > 0 && addedExtras.map((movie) => {
        return <div key={movie.id} className="flex items-center gap-2 w-20">
          {movie && <MovieInlinePreview movie={movie} />}
        </div>
      })}
      {isAdmin && episode && <div className="flex justify-center items-center gap-2 w-full p-2">
        <AddEpisodeExtraModal episode={episode} setMovieAdded={addExtra} />
      </div>}
    </>
  )
}