import { env } from "@/env.mjs";
import { listEpisodeHistory } from "@/server/convex/episodes";

export default async function HistoryPage() {
  if (env.NEXT_PUBLIC_BBPC_BACKEND === "convex") {
    const [{ HistoryPageClient }, episodes] = await Promise.all([
      import("./HistoryPageClient"),
      listEpisodeHistory(),
    ]);
    return <HistoryPageClient allEpisodes={episodes} />;
  }

  const { SqlHistoryPage } = await import("./SqlHistoryPage");
  return <SqlHistoryPage />;
}
