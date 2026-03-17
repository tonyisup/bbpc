import { MetadataRoute } from 'next';
import { db } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const episodes = await db.episode.findMany({
    select: { id: true },
  });

  const episodeEntries = episodes.map((episode) => ({
    url: `https://badboyspodcast.com/episodes/${episode.id}`,
    lastModified: new Date(),
  }));

  return [
    {
      url: 'https://badboyspodcast.com',
      lastModified: new Date(),
    },
    ...episodeEntries,
  ];
}
