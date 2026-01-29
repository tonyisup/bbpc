'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { api } from "@/trpc/react";
import { Episode } from "@/components/Episode";
import SearchFilter from "@/components/common/SearchFilter";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { type RouterOutputs } from "@/utils/trpc";

function SearchResults({
  episodes,
  query,
  isLoading
}: {
  episodes: RouterOutputs['episode']['history'],
  query: string,
  isLoading: boolean
}) {
  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!query) {
    return <p className="text-center text-gray-400">Enter a search term to find episodes.</p>;
  }

  if (episodes.length === 0) {
    return <p className="text-gray-400">No episodes found matching your search.</p>;
  }

  return (
    <>
      {episodes.map((episode) => (
        <li className="mb-8" key={episode.id}>
          <Episode episode={episode} showMovieTitles={true} searchQuery={query} />
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

  // Fetch all episodes for client-side fuzzy search
  const { data: allEpisodes, isLoading } = api.episode.history.useQuery(undefined, {
    staleTime: Infinity, // Cache the history data
    refetchOnWindowFocus: false,
  });

  // Initialize Fuse instance when data is available
  const fuse = useMemo(() => {
    if (!allEpisodes) return null;
    return new Fuse(allEpisodes, {
      keys: ['title', 'assignments.movie.title'],
      threshold: 0.4,
      ignoreLocation: true,
    });
  }, [allEpisodes]);

  // Compute filtered episodes based on local query
  const filteredEpisodes = useMemo(() => {
    if (!allEpisodes) return [];
    const trimmed = query.trim();
    if (!trimmed) return [];

    if (!fuse) return [];

    return fuse.search(trimmed).map(result => result.item);
  }, [allEpisodes, query, fuse]);

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
        <SearchFilter onSearch={handleSearch} initialValue={query} />
      </div>
      <ul className="w-full max-w-4xl">
        <SearchResults
          episodes={filteredEpisodes}
          query={query.trim()}
          isLoading={isLoading}
        />
      </ul>
    </div>
  );
}
