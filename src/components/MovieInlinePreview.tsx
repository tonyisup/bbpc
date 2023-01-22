import type { Movie } from "@prisma/client";
import Image from "next/image";
import type { FC } from "react";

interface MovieInlinePreviewProps {
  movie: Movie
}

const MovieInlinePreview: FC<MovieInlinePreviewProps> = ({movie}) => {
  return <a 
    className="inline-flex w-full items-center justify-between" 
    href={movie.url}>
      {movie.poster && 
        <Image src={movie.poster} alt={movie.title} className="w-36" />
      }
  </a>
}

export default MovieInlinePreview;