import { Movie } from "@prisma/client";
import { FC } from "react";

interface MovieInlinePreviewProps {
  movie: Movie
}

const MovieInlinePreview: FC<MovieInlinePreviewProps> = ({movie}) => {
  return <a className="inline-flex w-full items-center justify-between" href={movie.url}>
      {movie.poster && <img src={movie.poster} alt={movie.title} className="w-36" />}
        {/* <span className="px-2">{movie.title}</span>
        <span className="text-xs"> ({movie.year})</span> */}
    </a>
}

export default MovieInlinePreview;