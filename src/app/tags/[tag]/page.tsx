import { Suspense } from "react";
import { TagPageClient } from "./TagPageClient";

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
