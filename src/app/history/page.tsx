'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { api } from "@/trpc/react";
import { Episode } from "@/components/Episode";
import SearchFilter from "@/components/common/SearchFilter";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Fuse, { type FuseResultMatch } from "fuse.js";
import { debounce } from 'lodash';
import { type RouterOutputs } from "@/utils/trpc";

const FUZZY_SEARCH_STORAGE_KEY = "bbpc-history-fuzzy-search";

type HistoryEpisode = RouterOutputs["episode"]["history"][number];

type HistorySearchRow = {
  episode: HistoryEpisode;
  fuseMatches?: ReadonlyArray<FuseResultMatch>;
};

function episodeMatchesSubstring(episode: HistoryEpisode, needleLower: string): boolean {
  if (episode.title.toLowerCase().includes(needleLower)) {
    return true;
  }
  for (const a of episode.assignments) {
    const t = a.movie?.title;
    if (t !== undefined && t !== null && t.toLowerCase().includes(needleLower)) {
      return true;
    }
  }
  for (const e of episode.extras) {
    const movieTitle = e.review.movie?.title;
    if (
      movieTitle !== undefined &&
      movieTitle !== null &&
      movieTitle.toLowerCase().includes(needleLower)
    ) {
      return true;
    }
    const showTitle = e.review.show?.title;
    if (
      showTitle !== undefined &&
      showTitle !== null &&
      showTitle.toLowerCase().includes(needleLower)
    ) {
      return true;
    }
  }
  return false;
}

function SearchResults({
  rows,
  query,
  isLoading,
}: {
  rows: HistorySearchRow[];
  query: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!query) {
    return <p className="text-center text-gray-400">Enter a search term to find episodes.</p>;
  }

  if (rows.length === 0) {
    return <p className="text-gray-400">No episodes found matching your search.</p>;
  }

  return (
    <>
      {rows.map(({ episode, fuseMatches }) => (
        <li className="mb-8" key={episode.id}>
          <Episode
            episode={episode}
            showMovieTitles={true}
            searchQuery={query}
            fuseMatches={fuseMatches}
          />
        </li>
      ))}
    </>
  );
}

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize local query state from URL to allow immediate UI updates
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [fuzzySearch, setFuzzySearch] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FUZZY_SEARCH_STORAGE_KEY);
      if (stored === "true") setFuzzySearch(true);
      else if (stored === "false") setFuzzySearch(false);
    } catch {
      // ignore
    }
  }, []);

  const handleFuzzySearchChange = (enabled: boolean) => {
    setFuzzySearch(enabled);
    try {
      localStorage.setItem(FUZZY_SEARCH_STORAGE_KEY, enabled ? "true" : "false");
    } catch {
      // ignore
    }
  };

  // Fetch all episodes for client-side fuzzy search
  const { data: allEpisodes, isLoading } = api.episode.history.useQuery(undefined, {
    staleTime: Infinity, // Cache the history data
    refetchOnWindowFocus: false,
  });

  // Initialize Fuse instance when data is available
  const fuse = useMemo(() => {
    if (!allEpisodes) return null;
    return new Fuse(allEpisodes, {
      keys: [
        "title",
        "assignments.movie.title",
        "extras.review.movie.title",
        "extras.review.show.title",
      ],
      threshold: 0.4,
      ignoreLocation: true,
      includeMatches: true,
    });
  }, [allEpisodes]);

  // Compute filtered episodes based on local query
  const filteredRows = useMemo((): HistorySearchRow[] => {
    if (!allEpisodes) return [];
    const trimmed = query.trim();
    if (!trimmed) return [];

    if (fuzzySearch) {
      if (!fuse) return [];
      return fuse.search(trimmed).map((result) => ({
        episode: result.item,
        fuseMatches: result.matches,
      }));
    }

    const needle = trimmed.toLowerCase();
    return allEpisodes
      .filter((ep) => episodeMatchesSubstring(ep, needle))
      .map((episode) => ({ episode }));
  }, [allEpisodes, query, fuse, fuzzySearch]);

  // Debounced URL updater to prevent browser history spam
  const debouncedUpdateUrl = useMemo(
    () => debounce((newQuery: string, currentParamsString: string) => {
      const params = new URLSearchParams(currentParamsString);
      if (newQuery) {
        params.set('q', newQuery);
      } else {
        params.delete('q');
      }
      router.push(`/history?${params.toString()}`);
    }, 500),
    [router]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateUrl.cancel();
    };
  }, [debouncedUpdateUrl]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    // Pass the current params string to preserve other potential params
    debouncedUpdateUrl(newQuery, searchParams.toString());
  };

  const trimmedQuery = query.trim();

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="flex justify-between items-center w-full max-w-4xl">
        <h2 className="text-2xl font-bold">Search Episodes</h2>
        <Link
          href="/episodes"
          className="text-red-600 hover:text-red-700"
        >
          View All
        </Link>
      </div>
      <div className="w-full max-w-4xl">
        <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={fuzzySearch}
            onChange={(e) => handleFuzzySearchChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <span>Fuzzy search</span>
        </label>
        <div className="mb-6 space-y-2">
          <SearchFilter onSearch={handleSearch} initialValue={query} />
          {trimmedQuery ? (
            <p className="text-sm text-gray-600" aria-live="polite">
              {isLoading
                ? "Searching…"
                : `${filteredRows.length} ${filteredRows.length === 1 ? "result" : "results"}`}
            </p>
          ) : null}
        </div>
      </div>
      <ul className="w-full max-w-4xl">
        <SearchResults
          rows={filteredRows}
          query={trimmedQuery}
          isLoading={isLoading}
        />
      </ul>
    </div>
  );
}
