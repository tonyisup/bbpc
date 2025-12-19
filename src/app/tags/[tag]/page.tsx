import { Suspense } from "react";
import type { Metadata } from "next";
import { TagPageClient } from "./TagPageClient";

const TMDB_API_BASE = "https://api.themoviedb.org/3";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ movieId?: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const { movieId } = await searchParams;

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

  if (!movieId) return defaultMeta;

  try {
    // Fetch movie from TMDB
    const response = await fetch(
      `${TMDB_API_BASE}/movie/${movieId}?api_key=${process.env.TMDB_API_KEY}`,
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

// Loading fallback for the Suspense boundary
function TagPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}

// Server Component - can be async and await params
export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return (
    <Suspense fallback={<TagPageLoading />}>
      <TagPageClient tag={tag} />
    </Suspense>
  );
}
