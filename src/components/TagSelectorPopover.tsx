"use client";

import { type FC } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Loader2 } from "lucide-react";

export interface TagSelectorPopoverProps {
  movieId: number;
  movieTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

/**
 * Popover component that displays available tags for a movie.
 * Clicking a tag navigates to the tag voting page with the movie pre-selected.
 */
export const TagSelectorPopover: FC<TagSelectorPopoverProps> = ({
  movieId,
  movieTitle,
  open,
  onOpenChange,
  children,
}) => {
  const { data, isLoading } = api.tag.getTags.useInfiniteQuery(
    { limit: 50 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: open, // Only fetch when popover is open
    }
  );

  const allTags = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 bg-gray-900 border-gray-700"
        align="center"
        sideOffset={8}
      >
        <div className="p-4 border-b border-gray-800">
          <h4 className="font-semibold text-white text-sm">Choose a tag for:</h4>
          <p className="text-gray-400 text-sm truncate mt-1">{movieTitle}</p>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading tags...</span>
            </div>
          ) : allTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Tag className="h-8 w-8 opacity-20 mb-2" />
              <p className="text-sm">No tags available</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-2">
              {allTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}/${movieId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                    bg-gray-800 text-gray-300 hover:bg-blue-600 hover:text-white
                    transition-colors capitalize"
                  onClick={() => onOpenChange(false)}
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default TagSelectorPopover;
