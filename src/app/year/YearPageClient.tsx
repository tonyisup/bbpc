"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import MovieCard from "@/components/MovieCard";
import { LayoutGrid, List, Table as TableIcon, ArrowDownUp, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import RatingIcon from "@/components/RatingIcon";
import UserTag from "@/components/UserTag";

type ViewMode = "grid" | "table" | "list";

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
							onClick={() => setViewMode("table")}
							className={viewMode === "table" ? "bg-zinc-700" : ""}
							title="Table View"
						>
							<TableIcon className="h-5 w-5" />
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

					{viewMode === "table" && (
						<div className="rounded-md border border-zinc-800 overflow-hidden overflow-x-auto">
							<table className="w-full text-sm text-left text-zinc-300">
								<thead className="bg-zinc-900 text-zinc-400 uppercase">
									<tr>
										<th className="px-6 py-3">Movie</th>
										<th className="px-6 py-3">Year</th>
										<th className="px-6 py-3">Rating</th>
										<th className="px-6 py-3">Reviewed On</th>
										<th className="px-6 py-3">Links</th>
									</tr>
								</thead>
								<tbody>
									{sortedItems.map((item) => (
										<tr key={item.id} className="bg-black/20 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors">
											<td className="px-6 py-4 font-medium text-white">
												<div className="flex items-center gap-3">
													{item.movie.poster && (
														<img src={item.movie.poster} alt="" className="w-10 h-14 object-cover rounded" />
													)}
													<span>{item.movie.title}</span>
												</div>
											</td>
											<td className="px-6 py-4">{item.movie.year}</td>
											<td className="px-6 py-4">
												{item.rating ? (
													<div className="flex items-center gap-2">
														<RatingIcon value={item.rating.value} />
														<span>{item.rating.value}</span>
													</div>
												) : (
													<span className="text-zinc-600">-</span>
												)}
											</td>
											<td className="px-6 py-4">
												{item.episode ? (
													<div className="flex flex-col">
														<span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
														<span className="text-xs text-zinc-500">Ep {item.episode.number}</span>
													</div>
												) : (
													<span>{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
												)}
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-3">
													{item.movie.url && (
														<a href={item.movie.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
															IMDb
														</a>
													)}
													{item.episode && (
														<Link href={`/episodes/${item.episode.id}`} className="text-green-400 hover:underline">
															Episode
														</Link>
													)}
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}

					{viewMode === "list" && (
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
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
