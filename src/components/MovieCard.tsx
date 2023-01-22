import type { Movie } from "@prisma/client";
import Image from "next/image";
import type { FC } from "react";

interface MovieCardProps {
  movie: Movie,
  width?: number,
  height?: number
}

const MovieCard: FC<MovieCardProps> = ({ movie, width, height }) => {
  return (
    <div className="w-full flex justify-center text-white">
      <div>        
        <a href={movie.url} target="_blank" rel="noreferrer">
          <figure>
            {movie.poster && <Image width={width ?? 114} height={height ?? 216} src={movie.poster} alt={movie.title} />}
            <figcaption className="text-center">
              {movie.title} 
              <span className="text-xs"> ({movie.year})</span>
            </figcaption>
          </figure>
        </a>
      </div>
    </div>
  )
}

export default MovieCard