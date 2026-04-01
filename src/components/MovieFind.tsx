'use client';

import type { Movie } from "@prisma/client";
import { type FC, useEffect, useMemo, useState } from "react";
import type { Title } from "../server/tmdb/client";
import TitleCard from "./TitleCard";
import { api } from "@/trpc/react";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { debounce } from "lodash";
import { getPlainDateYear } from "@/lib/dates";
import type { SyllabusInsertPosition } from "@/lib/syllabus";

interface MovieFindProps {
  selectMovie: (movie: Movie, position: SyllabusInsertPosition) => void;
  selectedPosition?: SyllabusInsertPosition;
  onSelectedPositionChange?: (position: SyllabusInsertPosition) => void;
  /** True while `syllabus.add` is running (parent mutation). */
  isAddingToSyllabus?: boolean;
}

const MovieFind: FC<MovieFindProps> = ({
  selectMovie,
  selectedPosition = "END",
  onSelectedPositionChange,
  isAddingToSyllabus = false,
}) => {
  const [title, setTitle] = useState<Title | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [internalSelectedPosition, setInternalSelectedPosition] = useState<SyllabusInsertPosition>(selectedPosition);
  const [pendingInsertPosition, setPendingInsertPosition] = useState<SyllabusInsertPosition>(selectedPosition);

  const activePosition = onSelectedPositionChange ? selectedPosition : internalSelectedPosition;
  const setActivePosition = onSelectedPositionChange ?? setInternalSelectedPosition;

  const { data: resp, isLoading } = api.movie.searchByPage.useQuery({
    page: 1,
    term: searchQuery,
  });

  const { isFetching: isFetchingTitle } = api.movie.getTitle.useQuery({
    id: title?.id ?? 0,
  }, {
    enabled: Boolean(title?.id),
    onSuccess: (result) => {
      if (!title || !result || !title.poster_path) {
        return;
      }

      const year = getPlainDateYear(result.release_date) ?? 0;
      const fallbackTmdbUrl = `https://www.themoviedb.org/movie/${result.id}`;
      const url = result.imdb_path ?? fallbackTmdbUrl;

      addMovie({
        title: result.title,
        year,
        poster: result.poster_path,
        url,
        tmdbId: result.id,
      });
    },
  });

  const { mutate: addMovie, isPending: isSavingMovie } = api.movie.add.useMutation({
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      selectMovie(result, pendingInsertPosition);
    },
  });

  const selectTitle = (nextTitle: Title, position: SyllabusInsertPosition) => {
    setPendingInsertPosition(position);
    setActivePosition(position);
    setTitle(nextTitle);
    setSearchQuery("");
    setInputValue("");
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    [],
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const isAddPipelineBusy = 
    isFetchingTitle || isSavingMovie || isAddingToSyllabus;

  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-2">
      {isAddPipelineBusy && (
        <div
          className="z-30 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/75 px-4 py-4 text-center backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Adding to syllabus…</p>
        </div>
      )}
      {!isAddPipelineBusy && <div className="relative w-full">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search for a movie..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            debouncedSearch(e.target.value);
          }}
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4">
          {resp?.results.map((result) => (
            result?.poster_path && (
              <TitleCard
                key={result.id}
                title={result}
                titleSelected={selectTitle}
                syllabusInsertPosition={activePosition}
                onSyllabusInsertPositionChange={setActivePosition}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default MovieFind;