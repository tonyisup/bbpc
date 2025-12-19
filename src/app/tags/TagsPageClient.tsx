"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";
import { motion } from "motion/react";
import { Tag, Sparkles, ChevronRight, Hash } from "lucide-react";

export function TagsPageClient() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = api.tag.getTags.useInfiniteQuery(
    {
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]) return;
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <p className="animate-pulse text-lg font-medium text-red-400">Loading Tags...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        <div className="rounded-xl border border-red-500/20 bg-yellow-500/10 p-6 text-center backdrop-blur-md">
          <p className="text-xl font-bold">Error loading tags</p>
          <p className="text-sm opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  const allTags = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="min-h-screen px-4 py-12 text-white selection:bg-blue-500/30 sm:px-6 lg:px-8">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Sparkles className="h-4 w-4" />
              <span>Explore Categories</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              Movie Tags
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed">
              Discover movies across our curated collections. From high-octane action to festive favorites, find your next watch by vibe.
            </p>
          </motion.div>
        </header>

        {allTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Tag className="h-16 w-16 opacity-20 mb-4" />
            <p className="text-xl">No tags found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allTags.map((tag, index) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Link
                  href={`/tags/${tag.name}`}
                  className="group relative block h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-blue-500/50 hover:bg-white/[0.08] backdrop-blur-sm"
                >
                  {/* Decorative background icon */}
                  <div className="absolute -right-6 -top-6 text-white/[0.03] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:text-blue-500/10">
                    <Hash size={120} />
                  </div>

                  <div className="relative flex flex-col h-full">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-colors">
                        <Tag className="h-6 w-6 text-blue-400" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-600 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
                    </div>

                    <h2 className="text-2xl font-bold capitalize tracking-tight text-white group-hover:text-blue-400 transition-colors">
                      {tag.name}
                    </h2>

                    {tag.description && (
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {tag.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-400/70 group-hover:text-blue-400 transition-colors">
                        Browse Movies
                        <div className="h-px w-8 bg-blue-400/30 transition-all group-hover:w-12 group-hover:bg-blue-400" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Loading trigger for infinite scroll */}
        <div
          ref={observerTarget}
          className="mt-12 flex h-20 items-center justify-center"
        >
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 text-blue-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm font-medium">Fetching more vibes...</span>
            </div>
          )}
          {!hasNextPage && allTags.length > 0 && (
            <p className="text-sm text-gray-500 italic">No more tags to discover</p>
          )}
        </div>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #030712;
        }
        ::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
