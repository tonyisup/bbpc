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
      {movie.poster && (
        <div className="relative h-12 w-8 overflow-hidden rounded">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
      )}
      <span className="text-sm">
        {movie.title} ({movie.year})
      </span>
    </Link>
  );
}