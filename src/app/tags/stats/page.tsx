"use client";

import { api } from "@/trpc/react";
import Image from "next/image";

export default function StatsPage() {
  const { data: stats, isLoading, error } = api.tag.getAllStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-white">
        Loading stats...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900 text-red-500">
        Error loading stats: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8 text-white">
      <div className="container mx-auto">
        <h1 className="mb-8 text-3xl font-bold">Tag Statistics</h1>

        {stats?.length === 0 ? (
          <p>No votes recorded yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stats?.map((movie) => (
              <div
                key={movie.tmdbId}
                className="flex flex-col overflow-hidden rounded-lg bg-neutral-800 shadow-lg"
              >
                <div className="flex">
                  {movie.poster_path ? (
                    <div className="relative h-48 w-32 flex-shrink-0">
                      <Image
                        src={movie.poster_path}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 w-32 flex-shrink-0 items-center justify-center bg-neutral-700">
                      <span className="text-4xl">🎬</span>
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <h2 className="mb-2 text-xl font-bold">{movie.title}</h2>
                    <div className="max-h-36 overflow-y-auto">
                      {movie.tags.map((tagStat) => (
                        <div
                          key={tagStat.tag}
                          className="mb-2 flex items-center justify-between border-b border-neutral-700 pb-1 text-sm last:border-0"
                        >
                          <span className="font-semibold capitalize text-blue-300">
                            {tagStat.tag}
                          </span>
                          <div className="flex gap-3">
                            <span className="text-green-400">
                              Yes: {tagStat.yes}
                            </span>
                            <span className="text-red-400">
                              No: {tagStat.no}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
