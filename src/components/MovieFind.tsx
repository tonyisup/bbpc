'use client';

import type { Movie } from "@prisma/client";
import { type Dispatch, type FC, useState } from "react";
import type { Title } from "../server/tmdb/client";
import MovieCard from "./MovieCard";
import TitleCard from "./TitleCard";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface MovieFindProps {
  selectMovie: Dispatch<Movie>;
}

const MovieFind: FC<MovieFindProps> = ({ selectMovie }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [title, setTitle] = useState<Title | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { data: resp } = api.movie.searchByPage.useQuery({
    page: 1,
    term: searchQuery,
  });

  const { data: temp_title } = api.movie.getTitle.useQuery({
    id: title?.id ?? 0
  }, {
    onSuccess: (result) => {
      if (!title) return;
      if (!result) return;
      if (!title.poster_path) return;
      if (!result.imdb_path) return;

      const year = (new Date(result.release_date)).getFullYear();

      addMovie({
        title: result.title,
        year: year,
        poster: result.poster_path,
        url: result.imdb_path
      });
    }
  });

  const { mutate: addMovie } = api.movie.add.useMutation({
    onSuccess: (result) => {
      setSelectedMovie(result);
    }
  });

  const selectTitle = function (title: Title) {
    setTitle(title);
    setSearchQuery("");
  }

  const handleAddingExtra = function () {
    if (!selectedMovie) return;
    selectMovie(selectedMovie);
  }

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <Button
        variant="outline"
        onClick={handleAddingExtra}
        disabled={!selectedMovie}
      >
        Add Extra
      </Button>
      {selectedMovie && <MovieCard movie={selectedMovie} />}
      {!selectedMovie && title && <TitleCard title={title} />}
      {!selectedMovie && !title && (
        <div className="text-center text-muted-foreground">
          No movie selected
        </div>
      )}
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 pl-7"
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {resp?.results.map((title) => (
          title?.poster_path && (
            <TitleCard key={title.id} title={title} titleSelected={selectTitle} />
          )
        ))}
      </div>
    </div>
  );
};

export default MovieFind;