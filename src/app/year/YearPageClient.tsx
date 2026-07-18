"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import MovieCard from "@/components/MovieCard";
import {
  LayoutGrid,
  List,
  ArrowDownUp,
  Loader2,
  ExternalLink,
  Check,
  Trash2,
  GripVertical,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import RatingIcon from "@/components/RatingIcon";
import UserTag from "@/components/UserTag";
import { Reorder, useDragControls } from "motion/react";
import { getEpisodePath } from "@/lib/routes";
import {
  formatPlainDate,
  getPacificTodayPlainDate,
  getPlainDateYear,
} from "@/lib/dates";
import type { RouterOutputs } from "@/utils/trpc";

type ViewMode = "grid" | "list";
type RankedItem = NonNullable<
  RouterOutputs["rankedList"]["getListById"]
>["rankedItem"][number];

function getInitialViewMode(value: string | null): ViewMode {
  return value === "list" ? "list" : "grid";
}

// Separate component for reorder item to use drag controls
function RankedItemRow({
  item,
  index,
  onRemove,
  onDragEnd,
}: {
  item: RankedItem;
  index: number;
  onRemove: () => void;
  onDragEnd: () => void;
}) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate(50);
        }
      }}
      onDragEnd={onDragEnd}
    >
      <div className="group flex select-none items-center gap-3 rounded border border-zinc-700/50 bg-zinc-800/40 p-2 transition-colors hover:bg-zinc-800/80">
        {/* Drag Handle */}
        <button
          type="button"
          aria-label={`Drag ${item.movie?.title ?? "movie"} to reorder`}
          className="flex-shrink-0 cursor-grab touch-none p-1 text-zinc-500 active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-zinc-700/50 text-sm font-bold">
          {index + 1}
        </div>
        {item.movie?.poster && (
          <Image
            src={item.movie.poster}
            alt=""
            width={32}
            height={48}
            className="pointer-events-none h-12 w-8 rounded object-cover shadow"
          />
        )}
        <div className="min-w-0 flex-grow">
          <p className="truncate text-sm font-bold text-white">
            {item.movie?.title}
          </p>
          <p className="text-xs text-zinc-400">{item.movie?.year}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-500 transition-opacity hover:text-destructive"
          aria-label={`Remove ${item.movie?.title ?? "movie"} from ranking`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

export function YearPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const currentYear =
    getPlainDateYear(getPacificTodayPlainDate()) ?? new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(
    Number(searchParams.get("y")) || currentYear
  );
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getInitialViewMode(searchParams.get("view"))
  );
  const [sortDesc, setSortDesc] = useState<boolean>(
    searchParams.get("sort") !== "asc"
  );
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Sync URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("y", selectedYear.toString());
    params.set("view", viewMode);
    params.set("sort", sortDesc ? "desc" : "asc");
    router.replace(`/year?${params.toString()}`, { scroll: false });
  }, [selectedYear, viewMode, sortDesc, router]);

  const { data: items, isLoading } = api.year.getMyYearData.useQuery({
    year: selectedYear,
  });

  // Check if user is admin
  const { data: isAdmin } = api.auth.isAdmin.useQuery(undefined, {
    enabled: status === "authenticated",
    retry: false,
  });

  // Fetch user's MOVIE-type ranked lists (only for admins)
  const { data: rankedLists } = api.rankedList.getMyLists.useQuery(
    { targetType: "MOVIE" },
    { enabled: isAdmin === true }
  );

  // Fetch selected list details to get current items
  const { data: selectedList } = api.rankedList.getListById.useQuery(
    { id: selectedListId ?? "" },
    { enabled: !!selectedListId }
  );

  // Utils for cache invalidation
  const utils = api.useUtils();
  const invalidateRankedLists = () => {
    if (selectedListId) {
      void utils.rankedList.getListById.invalidate({ id: selectedListId });
    }
    void utils.rankedList.getMyLists.invalidate();
  };

  // Mutation for adding/updating items in the list
  const upsertItem = api.rankedList.upsertItem.useMutation({
    onSuccess: invalidateRankedLists,
  });

  // Mutation for removing items from the list
  const removeItem = api.rankedList.removeItem.useMutation({
    onSuccess: invalidateRankedLists,
  });

  // Mutation for reordering items
  const reorderItems = api.rankedList.reorderItems.useMutation({
    onSuccess: invalidateRankedLists,
  });

  // Local state for ordered items to support drag and drop
  const [orderedItems, setOrderedItems] = useState<RankedItem[]>([]);

  // Sync local state when selectedList changes
  useEffect(() => {
    if (selectedList?.rankedItem) {
      setOrderedItems(selectedList.rankedItem);
    }
  }, [selectedList]);

  // Sort items
  const sortedItems = items?.slice().sort((a, b) => {
    if (!a?.date || !b?.date) return 0;
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDesc ? dateB - dateA : dateA - dateB;
  });
  type YearItem = NonNullable<typeof items>[number];
  type YearEpisode = NonNullable<YearItem["episode"]>;
  type YearMovieGroup = {
    movie: YearItem["movie"];
    reviews: YearItem[];
    episodes: YearEpisode[];
  };
  const groupedMovies = sortedItems
    ? Array.from(
        sortedItems
          .reduce<Map<string, YearMovieGroup>>((groups, item) => {
            const existing = groups.get(item.movie.id);
            if (existing) {
              existing.reviews.push(item);
              const itemEpisode = item.episode;
              if (
                itemEpisode &&
                !existing.episodes.some(
                  (episode) => episode.id === itemEpisode.id
                )
              ) {
                existing.episodes.push(itemEpisode);
              }
            } else {
              groups.set(item.movie.id, {
                movie: item.movie,
                reviews: [item],
                episodes: item.episode ? [item.episode] : [],
              });
            }
            return groups;
          }, new Map())
          .values()
      )
    : [];

  // Filter items if a list is selected (hide items already in the list)
  const filteredItems = sortedItems?.filter((item) => {
    if (!selectedListId || !selectedList?.rankedItem) return true;
    return !selectedList.rankedItem.some(
      (rankedItem) => rankedItem.movieId === item.movie.id
    );
  });

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="bbpc-page space-y-6">
      <div className="bbpc-panel flex flex-col items-start justify-between gap-4 p-4 md:flex-row md:items-center">
        <div>
          <p className="bbpc-kicker">Movie archive</p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Year in review
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Year Selector */}
          <div className="relative">
            <label htmlFor="year-filter" className="sr-only">
              Review year
            </label>
            <select
              id="year-filter"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-11 cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-800 py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>

          {/* Sort Toggle */}
          <Button
            variant="ghost"
            onClick={() => setSortDesc(!sortDesc)}
            className={`h-11 ${sortDesc ? "bg-zinc-800" : ""}`}
            aria-pressed={sortDesc}
          >
            <ArrowDownUp className="h-5 w-5" />
            {sortDesc ? "Newest first" : "Oldest first"}
          </Button>

          {/* View Switcher */}
          <div
            className="flex items-center rounded-md bg-zinc-800 p-1"
            role="group"
            aria-label="View"
          >
            <Button
              variant="ghost"
              onClick={() => setViewMode("grid")}
              className={`h-11 px-3 ${
                viewMode === "grid" ? "bg-zinc-700" : ""
              }`}
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setViewMode("list")}
              className={`h-11 px-3 ${
                viewMode === "list" ? "bg-zinc-700" : ""
              }`}
              aria-label="List view"
              aria-pressed={viewMode === "list"}
            >
              <List className="h-5 w-5" />
              <span className="hidden sm:inline">List</span>
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : !sortedItems || sortedItems.length === 0 ? (
        <div className="py-20 text-center text-zinc-500">
          No movies found for {selectedYear}.
        </div>
      ) : (
        <div className="min-h-[50vh]">
          {viewMode === "grid" && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-6">
              {groupedMovies.map((group, index) => (
                <article key={group.movie.id} className="min-w-0">
                  <MovieCard
                    movie={group.movie}
                    width={200}
                    height={300}
                    priority={index === 0}
                  />
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    {group.reviews.length > 1 && (
                      <p className="font-semibold text-white">
                        {group.reviews.length} reviews
                      </p>
                    )}
                    <ul className="space-y-2" aria-label="Host ratings">
                      {group.reviews.map((review) => (
                        <li
                          key={review.id}
                          className="flex min-w-0 flex-wrap items-center gap-2"
                        >
                          <UserTag user={review.user} />
                          {review.rating && (
                            <span className="inline-flex items-center gap-1 text-xs text-zinc-300">
                              <RatingIcon value={review.rating.value} />
                              {review.rating.name}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    {group.episodes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        <span className="text-zinc-500">
                          {group.episodes.length === 1
                            ? "Episode:"
                            : "Episodes:"}
                        </span>
                        {group.episodes.map((episode) => (
                          <Link
                            key={episode.id}
                            href={getEpisodePath(episode.slug ?? episode.id)}
                            className="text-red-300 hover:underline"
                          >
                            Ep {episode.number}
                          </Link>
                        ))}
                      </div>
                    )}
                    {group.movie.url && (
                      <a
                        href={group.movie.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white"
                      >
                        IMDb <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-6">
              {/* Ranked List Selector for Admins */}
              {isAdmin && rankedLists && rankedLists.length > 0 && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Select a Ranked List to Add Movies:
                  </label>
                  <select
                    value={selectedListId || ""}
                    onChange={(e) => setSelectedListId(e.target.value || null)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 md:w-auto"
                  >
                    <option value="">None Selected</option>
                    {rankedLists.map((list) => (
                      <option key={list.id} value={list.id}>
                        {list.title || list.rankedListType.name} (
                        {list.rankedItem.length}/{list.rankedListType.maxItems})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Current Ranked Items Display */}
              {selectedListId && selectedList && orderedItems.length > 0 && (
                <div className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/40 p-6">
                  <h2 className="flex items-center gap-2 border-b border-zinc-700 pb-2 text-lg font-bold text-white">
                    <Check className="h-5 w-5 text-primary" />
                    Current Rankings:{" "}
                    {selectedList.title || selectedList.rankedListType.name}
                  </h2>
                  <Reorder.Group
                    axis="y"
                    values={orderedItems}
                    onReorder={setOrderedItems}
                    className="flex flex-col gap-3"
                  >
                    {orderedItems.map((item, index) => (
                      <RankedItemRow
                        key={item.id}
                        item={item}
                        index={index}
                        onRemove={() => {
                          if (confirm("Remove this item from the list?")) {
                            removeItem.mutate({ itemId: item.id });
                          }
                        }}
                        onDragEnd={() => {
                          reorderItems.mutate({
                            rankedListId: selectedListId,
                            itemIds: orderedItems.map((i) => i.id),
                          });
                        }}
                      />
                    ))}
                  </Reorder.Group>
                </div>
              )}

              <div className="flex flex-col gap-4">
                {filteredItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/40 p-4 transition-colors hover:bg-zinc-900/80 md:flex-row"
                  >
                    <div className="mx-auto flex-shrink-0 md:mx-0">
                      {item.movie.poster ? (
                        <Image
                          src={item.movie.poster}
                          alt={item.movie.title}
                          width={96}
                          height={144}
                          className="h-36 w-24 rounded object-cover shadow-lg"
                        />
                      ) : (
                        <div className="flex h-36 w-24 items-center justify-center rounded bg-zinc-800 text-zinc-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-grow flex-col justify-between py-1 text-center md:text-left">
                      <div>
                        <h3 className="mb-1 text-xl font-bold text-white">
                          {item.movie.title}
                        </h3>
                        <div className="mb-2 text-zinc-400">
                          {item.movie.year}
                        </div>

                        {item.rating && (
                          <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                            <div className="flex items-center gap-2 rounded-full bg-zinc-800 px-3 py-1">
                              <RatingIcon value={item.rating.value} />
                              <span className="font-medium text-white">
                                {item.rating.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 md:justify-start">
                        {item.episode && (
                          <div className="text-sm text-zinc-300">
                            Reviewed on{" "}
                            <Link
                              href={getEpisodePath(
                                item.episode.slug ?? item.episode.id
                              )}
                              className="font-semibold text-primary hover:underline"
                            >
                              Episode {item.episode.number}
                            </Link>
                            <span className="ml-2 text-zinc-500">
                              ({item.date ? formatPlainDate(item.date) : ""})
                            </span>
                          </div>
                        )}

                        <div className="ml-auto flex gap-3">
                          {item.movie.url && (
                            <a
                              href={item.movie.url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded border border-yellow-600/50 bg-yellow-600/20 px-3 py-1 text-xs text-yellow-500 transition-colors hover:bg-yellow-600/30"
                            >
                              IMDb
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rank Input (only show when list is selected) */}
                    {selectedListId &&
                      selectedList &&
                      (() => {
                        const existingItem = selectedList.rankedItem.find(
                          (rankedItem) => rankedItem.movieId === item.movie.id
                        );
                        const currentRank = existingItem?.rank;

                        return (
                          <div className="flex flex-shrink-0 items-center justify-center md:justify-end">
                            <div className="flex min-w-[200px] flex-col gap-2 rounded border border-zinc-700 bg-zinc-800/50 p-3">
                              <label className="text-xs font-medium text-zinc-400">
                                Rank in{" "}
                                {selectedList.title ||
                                  selectedList.rankedListType.name}
                                :
                              </label>
                              <div className="flex items-center gap-2">
                                <select
                                  defaultValue={currentRank || ""}
                                  className="flex-grow rounded border border-zinc-600 bg-zinc-900 px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  onChange={(e) => {
                                    const rank = parseInt(e.target.value);
                                    if (!isNaN(rank)) {
                                      upsertItem.mutate({
                                        rankedListId: selectedListId,
                                        movieId: item.movie.id,
                                        rank,
                                      });
                                    }
                                  }}
                                >
                                  <option value="" disabled>
                                    #
                                  </option>
                                  {Array.from(
                                    {
                                      length:
                                        selectedList.rankedListType.maxItems,
                                    },
                                    (_, i) => i + 1
                                  ).map((r) => (
                                    <option key={r} value={r}>
                                      Rank #{r}
                                    </option>
                                  ))}
                                </select>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    const select = e.currentTarget
                                      .previousElementSibling as HTMLSelectElement;
                                    const rank = parseInt(select.value);
                                    if (
                                      rank >= 1 &&
                                      rank <=
                                        selectedList.rankedListType.maxItems
                                    ) {
                                      upsertItem.mutate({
                                        rankedListId: selectedListId,
                                        movieId: item.movie.id,
                                        rank,
                                      });
                                    }
                                  }}
                                  className="bg-primary hover:bg-primary/80"
                                >
                                  {currentRank ? "Update" : "Add"}
                                </Button>
                              </div>
                              {currentRank && (
                                <div className="flex items-center gap-1 text-xs text-green-500">
                                  <Check className="h-3 w-3" />
                                  Currently #{currentRank}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
