'use client';

import { api } from "@/trpc/react";
import type {
  ExtraReview,
  Movie,
  Review,
  User,
  Episode as EpisodeType,
  Link as EpisodeLink,
  Assignment as AssignmentType,
  Show
} from "@prisma/client";
import { Episode } from "@/components/Episode";
import SearchFilter from "@/components/common/SearchFilter";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SearchResults({ query }: { query: string }) {
  const { data: episodes, isLoading } = api.episode.search.useQuery(
    { query },
    {
      enabled: query.length > 0,
      initialData: [],

    }
  );

  if (!query) {
    return <p className="text-center text-gray-400">Enter a search term to find episodes.</p>;
  }

  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  if (episodes.length === 0) {
    return <p className="text-gray-400">No episodes found matching your search.</p>;
  }

  return (
    <>
      {episodes.map((episode: EpisodeType & {
        assignments: (AssignmentType & {
          User: User;
          Movie: Movie | null;
        })[];
        extras: (ExtraReview & {
          Review: (Review & {
            User: User | null;
            Movie: Movie | null;
            Show: Show | null;
          })
        })[];
        links: EpisodeLink[];
      }) => (
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
  const query = searchParams.get('q') ?? '';
  const trimmedQuery = query.trim();

  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams(searchParams);
    if (newQuery) {
      params.set('q', newQuery);
    } else {
      params.delete('q');
    }
    router.push(`/history?${params.toString()}`);
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
        <SearchResults query={trimmedQuery} />
      </ul>
    </div>
  );
} 