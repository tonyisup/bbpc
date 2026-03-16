import { notFound, permanentRedirect } from "next/navigation";

import AddExtraPageClient from "./AddExtraPageClient";
import { db } from "@/server/db";
import { getEpisodeExtrasAddPath } from "@/lib/routes";
import { isUuid } from "@/server/slugs";

interface AddExtraPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AddExtraPage({ params }: AddExtraPageProps) {
  const { slug } = await params;

  const episode =
    (await db.episode.findUnique({
      where: { slug },
      select: { id: true, slug: true },
    })) ??
    (isUuid(slug)
      ? await db.episode.findUnique({
          where: { id: slug },
          select: { id: true, slug: true },
        })
      : null);

  if (!episode) {
    notFound();
  }

  if (episode.slug && isUuid(slug) && episode.id === slug) {
    permanentRedirect(getEpisodeExtrasAddPath(episode.slug));
  }

  return <AddExtraPageClient episodeId={episode.id} />;
}
