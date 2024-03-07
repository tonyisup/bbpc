import type { Movie } from "@prisma/client";
import Image from "next/image";
import type { FC } from "react";

interface MovieInlinePreviewProps {
  movie: Movie | null
}

const MovieInlinePreview: FC<MovieInlinePreviewProps> = ({movie}) => {
	if (!movie) return null;
	
  return <a 
    className="inline-flex w-full items-center justify-center" 
    href={movie.url}>
      {movie.poster && 
        <Image className="rounded-2xl" src={movie.poster} alt={movie.title} width={144} height={216} />
      }
  </a>
}

export default MovieInlinePreview;