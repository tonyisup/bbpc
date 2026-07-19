import type { Movie } from "@prisma/client";
import Image from "next/image";
import type { FC } from "react";

interface MovieCardProps {
  movie: Movie;
  width?: number;
  height?: number;
  priority?: boolean;
}

const MovieCard: FC<MovieCardProps> = ({
  movie,
  width,
  height,
  priority = false,
}) => {
  return (
    <div className="flex w-full justify-center text-white">
      <a href={movie.url} target="_blank" rel="noreferrer">
        <figure className="flex flex-col items-center justify-center">
          {movie.poster && (
            <Image
              width={width ?? 114}
              height={height ?? 216}
              src={movie.poster}
              alt={movie.title}
              priority={priority}
            />
          )}
          <figcaption className="text-center">
            {movie.title}
            <span className="text-xs"> ({movie.year})</span>
          </figcaption>
        </figure>
      </a>
    </div>
  );
};

export default MovieCard;
