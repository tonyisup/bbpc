import { notFound, permanentRedirect } from "next/navigation";

import { getEpisodeExtrasAddPath } from "@/lib/routes";
import { resolveEpisodeRouteParam } from "@/server/slugs";

import AddExtraPageClient from "./AddExtraPageClient";

export default async function SqlAddExtraPage({ slug }: { slug: string }) {
  const { episode, shouldRedirect } = await resolveEpisodeRouteParam(slug);

  if (!episode) {
    notFound();
  }

  if (shouldRedirect && episode.slug) {
    permanentRedirect(getEpisodeExtrasAddPath(episode.slug));
  }

  return <AddExtraPageClient episodeId={episode.id} />;
}
