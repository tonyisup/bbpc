'use client';

import { type Movie } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface MovieInlinePreviewProps {
  movie: Movie;
}

export default function MovieInlinePreview({ movie }: MovieInlinePreviewProps) {
  return (
    <Link
      href={movie.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:opacity-80"
    >
    {movie.poster && 
      <Image 
        unoptimized
        className="rounded-2xl" 
        src={movie.poster} 
        alt={movie.title} 
        width={144} 
        height={216} 
      />
    }
    </Link>
  );
}