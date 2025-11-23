'use client';

import { type Show } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { FC } from "react";
import { highlightText } from "@/utils/text";
import { cn } from "@/lib/utils";

interface ShowInlinePreviewProps {
  show: Show;
  searchQuery?: string;
  className?: string;
}

const ShowInlinePreview: FC<ShowInlinePreviewProps> = ({ show, searchQuery = "", className = "" }) => {
  return (
    <Link
      href={show.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("flex items-center gap-2 hover:opacity-80", className)}
    >
      {show.poster && (
        <Image
          className="rounded-2xl"
          src={show.poster}
          alt={show.title}
          width={144}
          height={216}
          priority={false}
          sizes="(max-width: 640px) 96px, 144px"
        />
      )}
      {searchQuery && <div className="text-sm">
        {highlightText(show.title, searchQuery)}
      </div>}
    </Link>
  );
}

export default ShowInlinePreview;