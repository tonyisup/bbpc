"use client";
import { api } from "@/trpc/react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function StatsPage() {
  const { data: tagStats, isLoading, error } = api.tag.getTagStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p>Loading aggregate stats...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Error loading stats: {error.message}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 text-white">
      <div className="container mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-black tracking-tight">Tag Activity</h1>

        {tagStats?.length === 0 ? (
          <p className="text-gray-400">No tag activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {tagStats?.map((stat) => {
              const yesPercent = stat.total > 0 ? (stat.yes / stat.total) * 100 : 0;
              const noPercent = stat.total > 0 ? (stat.no / stat.total) * 100 : 0;

              return (
                <Link
                  key={stat.tag}
                  href={`/tags/${stat.tag}`}
                  className="group block overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 transition-all hover:border-neutral-700 hover:bg-neutral-800/80"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold capitalize tracking-tight group-hover:text-blue-400 transition-colors">
                          {stat.tag}
                        </h2>
                        <p className="text-sm text-neutral-500">
                          {stat.total} total votes
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-neutral-400" />
                    </div>

                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className="absolute left-0 top-0 h-full bg-red-700 transition-all duration-1000"
                        style={{ width: `${noPercent}%` }}
                      />
                      <div
                        className="absolute right-0 top-0 h-full bg-green-700 transition-all duration-1000"
                        style={{ width: `${yesPercent}%` }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between gap-4 text-xs font-medium uppercase tracking-wider">
                      <span className="text-red-500">No: {stat.no} ({noPercent.toFixed(1)}%)</span>
                      <span className="text-green-500">Yes: {stat.yes} ({yesPercent.toFixed(1)}%)</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
