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
  const [currentPage, setCurrentPage] = useState(0);
  
  const { data: movies = [] } = api.movie.searchByNext10Page.useQuery(
    { term: searchTerm, page: currentPage },
    { enabled: searchTerm.length > 0 }
  );

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    selectMovie(movie);
    setSearchTerm("");
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Check if we got a full page of results (10 items), indicating there might be more
  const hasMoreResults = movies.length === 10;

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0); // Reset page when search term changes
            }}
            placeholder="Search for a movie..."
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {movies && movies.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-700 bg-gray-800">
              {movies.map((movie: Movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieSelect(movie)}
                  className="w-full p-2 text-left hover:bg-gray-700"
                >
                  {movie.title} ({movie.year})
                </button>
              ))}
              {hasMoreResults && (
                <button
                  onClick={handleLoadMore}
                  className="w-full border-t border-gray-700 p-2 text-center text-gray-400 hover:bg-gray-700"
                >
                  Load more...
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovieFind;