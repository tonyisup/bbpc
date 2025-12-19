"use client";

import { api } from "@/trpc/react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface MovieStat {
  tmdbId: number;
  yes: number;
  no: number;
  total: number;
  title: string;
  poster_path: string | null;
}

export function StatsPageClient({ tag }: { tag: string }) {
  const [allStats, setAllStats] = useState<MovieStat[]>([]);
  const [sortMethod, setSortMethod] = useState<"votes" | "yesPercent" | "yesCount">("votes");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.tag.getMoviesStats.useInfiniteQuery(
      { tag, limit: 50 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        // Since we are sorting on client anyway, and the server returns sorted by votes,
        // we might just append. But sorting by other metrics requires all data or complex server sorting.
        // For now, let's just append.
      }
    );

  useEffect(() => {
    if (data) {
      const stats = data.pages.flatMap(page => page.items);
      setAllStats(stats);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="animate-pulse">Loading stats...</div>
      </div>
    );
  }

  if (!allStats || allStats.length === 0) {
    if (isLoading) return null; // Wait for loading
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-white p-4">
        <h2 className="text-2xl font-bold mb-4">No stats available</h2>
        <p className="mb-8">No votes have been cast for "{tag}" yet.</p>
        <Link
          href={`/tags/${tag}`}
          className="px-6 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
        >
          Go Vote
        </Link>
      </div>
    );
  }

  const sortedStats = [...allStats].sort((a, b) => {
    if (sortMethod === "votes") {
      return b.total - a.total;
    } else if (sortMethod === "yesPercent") {
      const aPercent = a.total > 0 ? a.yes / a.total : 0;
      const bPercent = b.total > 0 ? b.yes / b.total : 0;
      if (Math.abs(bPercent - aPercent) < 0.001) return b.total - a.total;
      return bPercent - aPercent;
    } else if (sortMethod === "yesCount") {
      if (b.yes === a.yes) return b.total - a.total;
      return b.yes - a.yes;
    }
    return 0;
  });

  return (
    <div className="min-h-screen text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <Link
            href={`/tags/${tag}`}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold capitalize">
            Stats: Is it {tag}?
          </h1>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSortMethod("votes")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${sortMethod === "votes" ? "bg-white text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            Most Votes
          </button>
          <button
            onClick={() => setSortMethod("yesPercent")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${sortMethod === "yesPercent" ? "bg-white text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            Highest Agreement
          </button>
          <button
            onClick={() => setSortMethod("yesCount")}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${sortMethod === "yesCount" ? "bg-white text-black font-medium" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
          >
            Most "Yes" Votes
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedStats.map((movie) => {
            const yesPercent = movie.total > 0 ? (movie.yes / movie.total) * 100 : 0;
            const noPercent = movie.total > 0 ? (movie.no / movie.total) * 100 : 0;

            return (
              <div key={movie.tmdbId} className="bg-gray-900 rounded-lg overflow-hidden shadow-lg flex flex-col border border-gray-800">
                <div className="relative h-48 bg-gray-800 group overflow-hidden">
                  {movie.poster_path ? (
                    <img
                      src={movie.poster_path}
                      alt={movie.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      No Poster
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-90" />
                  <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2 text-white shadow-black drop-shadow-md">{movie.title}</h3>
                    <p className="text-xs text-gray-300 mt-1 font-medium">{movie.total} votes</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-end bg-gray-900">
                  <div className="flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-wider">
                    <span className="text-green-400">Yes {Math.round(yesPercent)}%</span>
                    <span className="text-red-400">No {Math.round(noPercent)}%</span>
                  </div>

                  <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
                    {movie.yes > 0 && (
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${yesPercent}%` }}
                      />
                    )}
                    {movie.no > 0 && (
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${noPercent}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>{movie.yes} votes</span>
                    <span>{movie.no} votes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {hasNextPage && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading more..." : "Load More Movies"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
