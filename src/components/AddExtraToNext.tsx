import { type FC, useState } from "react";
import AddEpisodeExtraModal from "./AddEpisodeExtraModal";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review } from '@prisma/client';
import { trpc } from "../utils/trpc";
import MovieInlinePreview from "./MovieInlinePreview";

interface AddExtraToNextProps {
  episode:  (EpisodeType & {
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
export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {  
	const { data: isAdmin } = trpc.auth.isAdmin.useQuery();
  const [addedExtras, setAddedExtras] = useState<Movie[]>([]);
  
  const addExtra = (movie: Movie) => {
    setAddedExtras([...addedExtras, movie]);
  }
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