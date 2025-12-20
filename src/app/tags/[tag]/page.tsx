import { Suspense } from "react";
import type { Metadata } from "next";
import { TagPageClient } from "./TagPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;

  // Capitalize tag for display
  const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

  return {
    title: `${displayTag} Movies | Bad Boys Podcast`,
    description: `Browse and vote on ${displayTag} movies with Bad Boys Podcast`,
    openGraph: {
      title: `${displayTag} Movies | Bad Boys Podcast`,
      description: `Browse and vote on ${displayTag} movies with Bad Boys Podcast`,
      type: "website",
    },
  };
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
