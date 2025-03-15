'use client';

import { type Movie } from "@prisma/client";
import { type FC, useState, type Dispatch } from "react";
import { api } from "@/trpc/react";
import MovieInlinePreview from "./MovieInlinePreview";

interface MovieFindProps {
  selectMovie: Dispatch<Movie>;
}

const MovieFind: FC<MovieFindProps> = ({ selectMovie }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  const { data: movies } = api.movie.search.useQuery(
    { term: searchTerm },
    { enabled: searchTerm.length > 0 }
  );

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    selectMovie(movie);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-2">
      {selectedMovie ? (
        <div className="flex items-center gap-2">
          <MovieInlinePreview movie={selectedMovie} />
          <button
            onClick={() => {
              setSelectedMovie(null);
              selectMovie(null as unknown as Movie);
            }}
            className="text-red-500 hover:text-red-400"
          >
            Clear
          </button>
        </div>
      ) : (
        <>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a movie..."
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {movies && movies.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-700 bg-gray-800">
              {movies.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className="w-full p-2 text-left hover:bg-gray-700"
                >
                  {movie.title} ({movie.year})
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovieFind;