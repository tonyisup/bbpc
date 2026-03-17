import { notFound, permanentRedirect } from "next/navigation";

import AddExtraPageClient from "./AddExtraPageClient";
import { getEpisodeExtrasAddPath } from "@/lib/routes";
import { resolveEpisodeRouteParam } from "@/server/slugs";

interface AddExtraPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AddExtraPage({ params }: AddExtraPageProps) {
  const { slug } = await params;
  const { episode, shouldRedirect } = await resolveEpisodeRouteParam(slug);

  if (!episode) {
    notFound();
  }

  if (shouldRedirect && episode.slug) {
    permanentRedirect(getEpisodeExtrasAddPath(episode.slug));
  }

  return <AddExtraPageClient episodeId={episode.id} />;
}
