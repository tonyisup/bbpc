import { getEpisodePath } from "@/lib/routes";
import type { MetadataRoute } from "next";
import { env } from "@/env.mjs";
import { listEpisodeHistory } from "@/server/convex/episodes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let episodes;
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    episodes = await listEpisodeHistory();
  } else {
    const { db } = await import("@/server/db");
    episodes = await db.episode.findMany({
      select: { id: true, slug: true },
    });
  }

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
