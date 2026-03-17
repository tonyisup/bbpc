import { db } from "@/server/db";
import { getEpisodePath } from "@/lib/routes";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const episodes = await db.episode.findMany({
    select: { id: true, slug: true },
  });

  const episodeEntries = episodes.map((episode) => ({
    url: `https://badboyspodcast.com${getEpisodePath(
      episode.slug ?? episode.id
    )}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: "https://badboyspodcast.com",
      lastModified: new Date(),
    },
    ...episodeEntries,
  ];
}
