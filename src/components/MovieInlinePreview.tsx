'use client';

import { type Movie } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { highlightText, highlightTextByIndices } from "@/utils/text";
import { cn } from "@/lib/utils";

interface MovieInlinePreviewProps {
  movie: Movie;
  searchQuery?: string;
  /** When set (e.g. fuzzy search), highlights Fuse match ranges on the title. */
  titleHighlightIndices?: ReadonlyArray<readonly [number, number]>;
  className?: string; // Applied to container (Link)
  imageClassName?: string; // Applied to Image
  responsive?: boolean;
}

const MovieInlinePreview: FC<MovieInlinePreviewProps> = ({
  movie,
  searchQuery = "",
  titleHighlightIndices,
  className = "",
  imageClassName = "",
  responsive = false,
}) => {
  const showTitle =
    Boolean(searchQuery) ||
    (titleHighlightIndices !== undefined && titleHighlightIndices.length > 0);
  return (
    <Link
      href={movie.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex items-center gap-2 hover:opacity-80", className)}
    >
      {movie.poster && (
        <Image
          className={cn(
            "rounded-2xl w-[96px] h-[144px] md:w-[144px] md:h-[216px]",
            responsive ? "w-[48px] h-[72px] sm:w-[144px] sm:h-[216px]" : "",
            imageClassName
          )}
          src={movie.poster}
          alt={movie.title}
          width={144}
          height={216}
          priority={false}
          sizes="(max-width: 640px) 48px, 144px"
        />
      )}
      {showTitle && (
        <div className="text-sm">
          {titleHighlightIndices && titleHighlightIndices.length > 0
            ? highlightTextByIndices(movie.title, titleHighlightIndices)
            : highlightText(movie.title, searchQuery)}
        </div>
      )}
    </Link>
  );
}

export default MovieInlinePreview;