import { Suspense } from "react";
import type { Metadata } from "next";
import { TagPageClient } from "../TagPageClient";

const TMDB_API_BASE = "https://api.themoviedb.org/3";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ tag: string; movieid: string }>;
}): Promise<Metadata> {
	const { tag, movieid } = await params;

	// Capitalize tag for display
	const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

	// Default metadata for tag page without specific movie
	const defaultMeta: Metadata = {
		title: `${displayTag} Movies | Bad Boys Podcast`,
		description: `Browse and vote on ${displayTag} movies with Bad Boys Podcast`,
		openGraph: {
			title: `${displayTag} Movies | Bad Boys Podcast`,
			description: `Browse and vote on ${displayTag} movies with Bad Boys Podcast`,
			type: "website",
		},
	};

	if (!movieid) return defaultMeta;

	try {
		// Fetch movie from TMDB
		const response = await fetch(
			`${TMDB_API_BASE}/movie/${movieid}?api_key=${process.env.TMDB_API_KEY}`,
			{ next: { revalidate: 86400 } } // Cache for 24 hours
		);
		if (!response.ok) return defaultMeta;

		const movie = await response.json();
		const posterUrl = movie.poster_path
			? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
			: undefined;

		const description = movie.overview || `Check out ${movie.title} on Bad Boys Podcast`;

		return {
			title: `${movie.title} | Bad Boys Podcast`,
			description,
			openGraph: {
				title: movie.title,
				description,
				type: "video.movie",
				images: posterUrl ? [{ url: posterUrl, width: 780, height: 1170 }] : [],
			},
			twitter: {
				card: "summary_large_image",
				title: movie.title,
				description: description.substring(0, 200),
				images: posterUrl ? [posterUrl] : [],
			},
		};
	} catch {
		return defaultMeta;
	}
}

// Loading fallback
function TagPageLoading() {
	return (
		<div className="flex min-h-screen items-center justify-center text-white">
			<div className="animate-pulse">Loading...</div>
		</div>
	);
}

// Server Component
export default async function TagMoviePage({ params }: { params: Promise<{ tag: string; movieid: string }> }) {
	const { tag, movieid } = await params;
	const initialMovieId = parseInt(movieid, 10);

	// If parsing fails, just render normal page (or could 404)
	const safeId = isNaN(initialMovieId) ? undefined : initialMovieId;

	return (
		<Suspense fallback={<TagPageLoading />}>
			<TagPageClient tag={tag} initialMovieId={safeId} />
		</Suspense>
	);
}
