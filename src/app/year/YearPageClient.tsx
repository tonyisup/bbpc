"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import MovieCard from "@/components/MovieCard";
import { LayoutGrid, List, ArrowDownUp, Loader2, ExternalLink, Check, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RatingIcon from "@/components/RatingIcon";
import UserTag from "@/components/UserTag";
import { Reorder, useDragControls } from "motion/react";

type ViewMode = "grid" | "table" | "list";

// Separate component for reorder item to use drag controls
function RankedItemRow({ item, index, onRemove, onDragEnd }: {
	item: any,
	index: number,
	onRemove: () => void,
	onDragEnd: () => void
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
			<div className="flex items-center gap-3 bg-zinc-800/40 p-2 rounded border border-zinc-700/50 group hover:bg-zinc-800/80 transition-colors select-none">
				{/* Drag Handle */}
				<div
					className="flex-shrink-0 text-zinc-500 cursor-grab active:cursor-grabbing p-1 touch-none"
					onPointerDown={(e) => dragControls.start(e)}
				>
					<GripVertical className="w-5 h-5" />
				</div>

				<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-zinc-700/50">
					{index + 1}
				</div>
				{item.Movie?.poster && (
					<img src={item.Movie.poster} alt="" className="w-8 h-12 object-cover rounded shadow pointer-events-none" />
				)}
				<div className="flex-grow min-w-0">
					<p className="text-sm font-bold text-white truncate">{item.Movie?.title}</p>
					<p className="text-xs text-zinc-400">{item.Movie?.year}</p>
				</div>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-zinc-500 hover:text-destructive transition-opacity"
					onClick={(e) => {
						e.stopPropagation();
						onRemove();
					}}
				>
					<Trash2 className="w-4 h-4" />
				</Button>
			</div>
		</Reorder.Item>
	);
}

export function YearPageClient() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState<number>(
		Number(searchParams.get("y")) || currentYear
	);
	const [viewMode, setViewMode] = useState<ViewMode>(
		(searchParams.get("view") as ViewMode) || "grid"
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
		router.push(`/year?${params.toString()}`);
	}, [selectedYear, viewMode, sortDesc, router]);

	const { data: items, isLoading } = api.year.getMyYearData.useQuery({
		year: selectedYear,
	});

	// Check if user is admin
	const { data: isAdmin } = api.auth.isAdmin.useQuery();

	// Fetch user's MOVIE-type ranked lists (only for admins)
	const { data: rankedLists } = api.rankedList.getMyLists.useQuery(
		{ targetType: "MOVIE" },
		{ enabled: isAdmin === true }
	);

	// Fetch selected list details to get current items
	const { data: selectedList } = api.rankedList.getListById.useQuery(
		{ id: selectedListId! },
		{ enabled: !!selectedListId }
	);

	// Utils for cache invalidation
	const utils = api.useUtils();

	// Mutation for adding/updating items in the list
	const upsertItem = api.rankedList.upsertItem.useMutation({
		onSuccess: () => {
			void utils.rankedList.getListById.invalidate({ id: selectedListId! });
			void utils.rankedList.getMyLists.invalidate();
		},
	});

	// Mutation for removing items from the list
	const removeItem = api.rankedList.removeItem.useMutation({
		onSuccess: () => {
			void utils.rankedList.getListById.invalidate({ id: selectedListId! });
			void utils.rankedList.getMyLists.invalidate();
		},
	});

	// Mutation for reordering items
	const reorderItems = api.rankedList.reorderItems.useMutation({
		onSuccess: () => {
			void utils.rankedList.getListById.invalidate({ id: selectedListId! });
			void utils.rankedList.getMyLists.invalidate();
		},
	});

	// Local state for ordered items to support drag and drop
	const [orderedItems, setOrderedItems] = useState<any[]>([]);

	// Sync local state when selectedList changes
	useEffect(() => {
		if (selectedList?.RankedItem) {
			setOrderedItems(selectedList.RankedItem);
		}
	}, [selectedList]);

	// Sort items
	const sortedItems = items?.slice().sort((a, b) => {
		if (!a?.date || !b?.date) return 0;
		const dateA = new Date(a.date).getTime();
		const dateB = new Date(b.date).getTime();
		return sortDesc ? dateB - dateA : dateA - dateB;
	});

	const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

	return (
		<div className="container mx-auto p-4 space-y-6">
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/50 p-4 rounded-lg">
				<h1 className="text-2xl font-bold text-white">Year in Review</h1>

				<div className="flex items-center gap-4 flex-wrap justify-center">
					{/* Year Selector */}
					<div className="relative">
						<select
							value={selectedYear}
							onChange={(e) => setSelectedYear(Number(e.target.value))}
							className="bg-zinc-800 text-white border border-zinc-700 rounded-md pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
						>
							{years.map(year => (
								<option key={year} value={year}>{year}</option>
							))}
						</select>
						<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
							<svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
						</div>
					</div>

					{/* Sort Toggle */}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSortDesc(!sortDesc)}
						className={sortDesc ? "bg-zinc-800" : ""}
						title={sortDesc ? "Newest First" : "Oldest First"}
					>
						<ArrowDownUp className="h-5 w-5" />
					</Button>

					{/* View Switcher */}
					<div className="flex items-center bg-zinc-800 rounded-md p-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setViewMode("grid")}
							className={viewMode === "grid" ? "bg-zinc-700" : ""}
							title="Grid View"
						>
							<LayoutGrid className="h-5 w-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setViewMode("list")}
							className={viewMode === "list" ? "bg-zinc-700" : ""}
							title="List View"
						>
							<List className="h-5 w-5" />
						</Button>
					</div>
				</div>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-20">
					<Loader2 className="h-10 w-10 animate-spin text-primary" />
				</div>
			) : !sortedItems || sortedItems.length === 0 ? (
				<div className="text-center py-20 text-zinc-500">
					No movies found for {selectedYear}.
				</div>
			) : (
				<div className="min-h-[50vh]">
					{viewMode === "grid" && (
						<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
							{sortedItems.map((item) => (
								<div key={item.id} className="relative group">
									<MovieCard movie={item.movie} width={200} height={300} />
									{/* Grid Overlay with Links */}
									<div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 rounded-lg gap-2">
										{item.episode && (
											<Link href={`/episodes/${item.episode.id}`} className="text-white hover:text-primary font-semibold text-sm flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
												Episode {item.episode.number}
											</Link>
										)}

										{item.movie.url && (
											<a href={item.movie.url} target="_blank" rel="noreferrer" className="text-yellow-500 hover:text-yellow-400 font-semibold text-sm flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors">
												IMDb <ExternalLink className="h-3 w-3" />
											</a>
										)}

										{item.rating && (
											<div className="mt-2 bg-zinc-800/80 px-2 py-1 rounded flex items-center gap-1">
												<UserTag user={item.user} />
												<RatingIcon value={item.rating.value} />
											</div>
										)}
									</div>

									<div className="mt-2 text-center text-sm text-zinc-400 group-hover:opacity-0 transition-opacity">
										{item.episode && (
											<div className="text-xs">
												Ep #{item.episode.number}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}

					{viewMode === "list" && (
						<div className="space-y-6">
							{/* Ranked List Selector for Admins */}
							{isAdmin && rankedLists && rankedLists.length > 0 && (
								<div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800">
									<label className="text-sm font-medium text-zinc-300 mb-2 block">
										Select a Ranked List to Add Movies:
									</label>
									<select
										value={selectedListId || ""}
										onChange={(e) => setSelectedListId(e.target.value || null)}
										className="bg-zinc-800 text-white border border-zinc-700 rounded-md px-3 py-2 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-primary/50"
									>
										<option value="">None Selected</option>
										{rankedLists.map((list) => (
											<option key={list.id} value={list.id}>
												{list.title || list.RankedListType.name} ({list.RankedItem.length}/{list.RankedListType.maxItems})
											</option>
										))}
									</select>
								</div>
							)}

							{/* Current Ranked Items Display */}
							{selectedListId && selectedList && orderedItems.length > 0 && (
								<div className="bg-zinc-900/40 p-6 rounded-lg border border-zinc-800 space-y-4">
									<h2 className="text-lg font-bold text-white border-b border-zinc-700 pb-2 flex items-center gap-2">
										<Check className="w-5 h-5 text-primary" />
										Current Rankings: {selectedList.title || selectedList.RankedListType.name}
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
														rankedListId: selectedListId!,
														itemIds: orderedItems.map((i) => i.id),
													});
												}}
											/>
										))}
									</Reorder.Group>
								</div>
							)}

							<div className="flex flex-col gap-4">
								{sortedItems.map((item) => (
									<div key={item.id} className="flex flex-col md:flex-row gap-4 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800/50 hover:bg-zinc-900/80 transition-colors">
										<div className="flex-shrink-0 mx-auto md:mx-0">
											{item.movie.poster ? (
												<img src={item.movie.poster} alt={item.movie.title} className="w-24 h-36 object-cover rounded shadow-lg" />
											) : (
												<div className="w-24 h-36 bg-zinc-800 rounded flex items-center justify-center text-zinc-500">No Image</div>
											)}
										</div>
										<div className="flex-grow flex flex-col justify-between py-1 text-center md:text-left">
											<div>
												<h3 className="text-xl font-bold text-white mb-1">{item.movie.title}</h3>
												<div className="text-zinc-400 mb-2">{item.movie.year}</div>

												{item.rating && (
													<div className="flex items-center justify-center md:justify-start gap-2 mb-3">
														<div className="bg-zinc-800 px-3 py-1 rounded-full flex items-center gap-2">
															<RatingIcon value={item.rating.value} />
															<span className="font-medium text-white">{item.rating.name}</span>
														</div>
													</div>
												)}
											</div>

											<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
												{item.episode && (
													<div className="text-sm text-zinc-300">
														Reviewed on <Link href={`/episodes/${item.episode.id}`} className="text-primary hover:underline font-semibold">Episode {item.episode.number}</Link>
														<span className="text-zinc-500 ml-2">({item.date ? new Date(item.date).toLocaleDateString() : ''})</span>
													</div>
												)}

												<div className="flex gap-3 ml-auto">
													{item.movie.url && (
														<a href={item.movie.url} target="_blank" rel="noreferrer" className="text-xs bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 px-3 py-1 rounded hover:bg-yellow-600/30 transition-colors">
															IMDb
														</a>
													)}
												</div>
											</div>
										</div>

										{/* Rank Input (only show when list is selected) */}
										{selectedListId && selectedList && (() => {
											const existingItem = selectedList.RankedItem.find(
												(rankedItem) => rankedItem.movieId === item.movie.id
											);
											const currentRank = existingItem?.rank;

											return (
												<div className="flex-shrink-0 flex items-center justify-center md:justify-end">
													<div className="flex flex-col gap-2 bg-zinc-800/50 p-3 rounded border border-zinc-700 min-w-[200px]">
														<label className="text-xs font-medium text-zinc-400">
															Rank in {selectedList.title || selectedList.RankedListType.name}:
														</label>
														<div className="flex items-center gap-2">
															<select
																defaultValue={currentRank || ""}
																className="flex-grow bg-zinc-900 text-white border border-zinc-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
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
																<option value="" disabled>#</option>
																{Array.from({ length: selectedList.RankedListType.maxItems }, (_, i) => i + 1).map((r) => (
																	<option key={r} value={r}>
																		Rank #{r}
																	</option>
																))}
															</select>
															<Button
																size="sm"
																onClick={(e) => {
																	const select = e.currentTarget.previousElementSibling as HTMLSelectElement;
																	const rank = parseInt(select.value);
																	if (rank >= 1 && rank <= selectedList.RankedListType.maxItems) {
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
															<div className="text-xs text-green-500 flex items-center gap-1">
																<Check className="w-3 h-3" />
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
	)
}
