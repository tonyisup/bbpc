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
const homePage = await readFile(
  new URL("../src/app/page.tsx", import.meta.url),
  "utf8"
);
const historyPage = await readFile(
  new URL("../src/app/history/page.tsx", import.meta.url),
  "utf8"
);
const historyClient = await readFile(
  new URL("../src/app/history/HistoryPageClient.tsx", import.meta.url),
  "utf8"
);
const sqlHistoryPage = await readFile(
  new URL("../src/app/history/SqlHistoryPage.tsx", import.meta.url),
  "utf8"
);
const gambling = await readFile(
  new URL("../src/server/convex/gambling.ts", import.meta.url),
  "utf8"
);
const middleware = await readFile(
  new URL("../src/middleware.ts", import.meta.url),
  "utf8"
);
const nextEpisodeApi = await readFile(
  new URL("../src/app/api/episode/next/route.ts", import.meta.url),
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
    historyPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory\(\)[\s\S]*import\("\.\/SqlHistoryPage"\)/u
  );
  assert.doesNotMatch(historyClient, /trpc|next-auth|@prisma|server\/db/u);
  assert.match(sqlHistoryPage, /api\.episode\.history\.useQuery/u);
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
  assert.match(
    homePage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getLatestPublishedEpisode/u
  );
  assert.match(
    homePage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*hasSignedInUserWonForEpisode/u
  );
  assert.match(
    homePage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*nextEpisode[\s\S]*<Episode episode=\{nextEpisode\} allowGuesses/u
  );
  assert.match(
    nextEpisodeApi,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getNextScheduledEpisode[\s\S]*await import\("@\/server\/api\/trpc"\)/u
  );
  assert.doesNotMatch(
    nextEpisodeApi,
    /^import .*["']@\/server\/api\/trpc["'];?$/mu
  );
  assert.match(
    nextEpisodeApi,
    /"assignmentReviews" in assignment[\s\S]*: \[\]/u
  );
  assert.match(gambling, /games\/gambling:hasWonForEpisode/u);
  assert.match(
    gambling,
    /AUTHENTICATION_REQUIRED[\s\S]*IDENTITY_NOT_LINKED[\s\S]*IDENTITY_CONFLICT[\s\S]*ACCOUNT_DISABLED[\s\S]*isClerkAPIResponseError\(error\)[\s\S]*error\.status === 404[\s\S]*return false/u
  );
  assert.match(client, /auth\(\)/u);
  assert.match(client, /getToken\(\{ template: "convex" \}\)/u);
  assert.match(
    client,
    /isClerkAPIResponseError\(error\)[\s\S]*error\.status !== 404/u
  );
  assert.match(
    client,
    /setTimeout\(resolve, 250\)[\s\S]*setTimeout\(resolve, 500\)/u
  );
});

test("Clerk middleware matches routes before Next.js locale rewriting", () => {
  assert.match(middleware, /clerkMiddleware/u);
  assert.equal(middleware.match(/locale: false/gu)?.length, 3);
});

test("the public episode presentation contract is storage-neutral", () => {
  assert.doesNotMatch(episodeTypes, /@prisma\/client/u);
  assert.match(episodeTypes, /date: Date \| string \| null/u);
  assert.match(episodeTypes, /only fields used by public episode surfaces/u);
});
