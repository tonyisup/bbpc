"use client";

import { type FC, type ReactNode } from "react";

export interface MovieSearchCardProps {
  movie: {
    id: number;
    title: string;
    poster_path: string | null;
  };
  onClick?: () => void;
  children?: ReactNode;
}

/**
 * Reusable movie card component for search results and stats displays.
 * Displays poster, title, and optional children (e.g., vote stats bar).
 */
export const MovieSearchCard: FC<MovieSearchCardProps> = ({ movie, onClick, children }) => {
  return (
    <div
      className={`cursor-pointer bg-gray-900 rounded-lg overflow-hidden shadow-lg flex flex-col border border-gray-800 ${onClick ? "cursor-pointer hover:border-blue-500/50 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="relative h-48 bg-gray-800 group overflow-hidden">
        {movie.poster_path ? (
          <img
            src={movie.poster_path}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Poster
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white shadow-black drop-shadow-md">
            {movie.title}
          </h3>
        </div>
      </div>

      {children && (
        <div className="p-4 flex-1 flex flex-col justify-end bg-gray-900">
          {children}
        </div>
      )}
    </div>
  );
};

export default MovieSearchCard;
