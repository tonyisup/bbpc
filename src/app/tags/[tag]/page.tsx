import { TagPageClient } from "./TagPageClient";

// Server Component - can be async and await params
export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  return <TagPageClient tag={tag} />;
}
