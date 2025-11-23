import type { Show } from "@prisma/client";
import { type Dispatch, type FC, useEffect, useMemo, useState } from "react";
import type { Title } from "../server/tmdb/client";
import { api } from "@/trpc/react";
import TitleCard from "./TitleCard";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShowFindProps {
  selectShow: Dispatch<Show>;
}

const ShowFind: FC<ShowFindProps> = ({ selectShow }) => {
  const [title, setTitle] = useState<Title | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [inputValue, setInputValue] = useState("");

  const { data: resp } = api.show.searchByPage.useQuery({
    page: 1,
    term: searchQuery,
  });

  const { data: temp_title } = api.show.getTitle.useQuery({
    id: title?.id ?? 0
  }, {
    onSuccess: (result) => {
      if (!title) return;
      if (!result) return;
      if (!title.poster_path) return;
      if (!result.imdb_path) return;

      const year = (new Date(result.release_date)).getFullYear();

      addShow({
        title: result.title,
        year: year,
        poster: result.poster_path,
        url: result.imdb_path
      });
    }
  });

  const { mutate: addShow } = api.show.add.useMutation({
    onSuccess: (result) => {
      if (!result) return;
      selectShow(result);
    }
  });

  const selectTitle = function (title: Title) {
    setTitle(title);
    setSearchQuery("");
    setInputValue("");
  }

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search for a show..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            debouncedSearch(e.target.value);
          }}
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

export default ShowFind;