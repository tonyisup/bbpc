import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const client = await readFile(
  new URL("../src/server/convex/client.ts", import.meta.url),
  "utf8"
);
const episodes = await readFile(
  new URL("../src/server/convex/episodes.ts", import.meta.url),
  "utf8"
);
const router = await readFile(
  new URL("../src/server/api/routers/episodeRouter.ts", import.meta.url),
  "utf8"
);
const episodeTypes = await readFile(
  new URL("../src/types/episode.ts", import.meta.url),
  "utf8"
);
const nextPage = await readFile(
  new URL("../src/app/next/page.tsx", import.meta.url),
  "utf8"
);
const episodesPage = await readFile(
  new URL("../src/app/episodes/page.tsx", import.meta.url),
  "utf8"
);
const sitemap = await readFile(
  new URL("../src/app/sitemap.ts", import.meta.url),
  "utf8"
);
const episodeDetailPage = await readFile(
  new URL("../src/app/episodes/[slug]/page.tsx", import.meta.url),
  "utf8"
);
const episodeResults = await readFile(
  new URL("../src/components/EpisodeResults.tsx", import.meta.url),
  "utf8"
);

test("anonymous next-episode reads use a fail-closed Convex adapter", () => {
  assert.match(client, /import "server-only"/u);
  assert.match(client, /NEXT_PUBLIC_BBPC_BACKEND !== "convex"/u);
  assert.match(client, /Convex mode requires NEXT_PUBLIC_CONVEX_URL/u);
  assert.match(episodes, /episodes\/public:nextScheduled/u);
  assert.match(episodes, /episodes\/public:search/u);
  assert.match(episodes, /episodes\/public:listPage/u);
  assert.match(episodes, /episodes\/public:getByLegacyId/u);
  assert.match(episodes, /episodes\/public:getBySlug/u);
  assert.match(episodes, /episodes\/public:results/u);
  assert.match(episodes, /episodeSchema\.nullable\(\)\.parse/u);
  assert.match(episodes, /HISTORY_EPISODE_LIMIT = 1_000/u);
  assert.match(episodes, /pagination did not advance/u);
  assert.match(
    router,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getNextScheduledEpisode/u
  );
  assert.match(
    router,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*searchEpisodes/u
  );
  assert.match(
    router,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory/u
  );
  assert.match(
    router,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getEpisodeByLegacyId/u
  );
  assert.match(
    nextPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getNextScheduledEpisode/u
  );
  assert.match(
    episodesPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory/u
  );
  assert.match(
    sitemap,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory/u
  );
  assert.match(
    episodeDetailPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getEpisodeResults/u
  );
  assert.doesNotMatch(episodeResults, /\bany\b/u);
  assert.match(episodeResults, /results: EpisodeResultsData/u);
});

test("the public episode presentation contract is storage-neutral", () => {
  assert.doesNotMatch(episodeTypes, /@prisma\/client/u);
  assert.match(episodeTypes, /date: Date \| string \| null/u);
  assert.match(episodeTypes, /only fields used by public episode surfaces/u);
});
