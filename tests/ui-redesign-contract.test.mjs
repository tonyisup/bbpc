import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (/** @type {string} */ path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the retired Tags feature has no UI or API surface and legacy URLs redirect", () => {
  assert.equal(existsSync(new URL("../src/app/tags", import.meta.url)), false);
  assert.equal(
    existsSync(
      new URL("../src/server/api/routers/tagRouter.ts", import.meta.url)
    ),
    false
  );
  assert.equal(
    existsSync(
      new URL("../src/components/TagSelectorPopover.tsx", import.meta.url)
    ),
    false
  );
  assert.equal(
    existsSync(
      new URL("../src/components/MovieSearchCard.tsx", import.meta.url)
    ),
    false
  );

  const nav = read("src/components/NavMenu.tsx");
  assert.doesNotMatch(nav, /href:\s*["']\/tags/);

  const apiRoot = read("src/server/api/root.ts");
  assert.doesNotMatch(apiRoot, /tagRouter|tag:\s*/);

  const nextConfig = read("next.config.mjs");
  assert.match(nextConfig, /source:\s*"\/tags"/);
  assert.match(nextConfig, /source:\s*"\/tags\/:path\*"/);
  assert.match(nextConfig, /destination:\s*["']\/history["']/);
});

test("the global shell uses the shared BBPC header and semantic visual tokens", () => {
  const layout = read("src/app/layout.tsx");
  const nav = read("src/components/NavMenu.tsx");
  assert.match(layout, /<SiteHeader\s*\/?>/);
  assert.doesNotMatch(
    layout,
    /<section className="py-2 flex flex-col items-center">/
  );
  assert.doesNotMatch(layout, /maximumScale/);
  assert.match(layout, /<main className="[^"]*min-w-0/);
  assert.match(
    nav,
    /pathname === href \|\| pathname\.startsWith\(`\$\{href\}\/`\)/
  );
  assert.doesNotMatch(nav, />Login<|>Logout</);
  assert.match(nav, /xl:flex/);
  assert.match(nav, /xl:hidden/);
  assert.match(nav, /aria-label="Open navigation menu"/);

  const styles = read("src/styles/globals.css");
  assert.match(styles, /--bbpc-accent:/);
  assert.match(styles, /--bbpc-surface:/);
  assert.match(styles, /\.bbpc-panel/);
  assert.doesNotMatch(styles, /overflow-x:\s*(hidden|clip)/);
  assert.doesNotMatch(styles, /min-width:\s*320px/);
});

test("home and game prioritize participation without duplicate retired behavior", () => {
  const home = read("src/app/page.tsx");
  assert.match(home, /Latest episode/);
  assert.match(home, /Up next/);

  const moviePreview = read("src/components/MovieInlinePreview.tsx");
  const latestEpisode = read("src/components/LatestEpisode.tsx");
  const episode = read("src/components/Episode.tsx");
  const episodeSkeleton = read("src/components/EpisodeSkeleton.tsx");
  const gameParticipation = read("src/components/GameParticipation.tsx");
  const standings = read("src/components/SeasonStandingsDisclosure.tsx");
  assert.match(moviePreview, /priority\?: boolean/);
  assert.match(latestEpisode, /priority=\{index === 0\}/);
  assert.match(episode, /<GameParticipation/);
  assert.match(episodeSkeleton, /min-w-0/);
  assert.doesNotMatch(episodeSkeleton, /h-\[216px\] w-\[144px\]/);
  assert.equal((gameParticipation.match(/Sign in to play/g) ?? []).length, 1);
  assert.match(standings, /isOpen\s*&&\s*\(/);
  assert.match(standings, /<GamePerformanceTracking/);

  const game = read("src/app/game/page.tsx");
  const nextEpisodeIndex = game.indexOf("<NextEpisode");
  const standingsIndex = game.indexOf("<SeasonStandingsDisclosure");
  assert.notEqual(nextEpisodeIndex, -1);
  assert.notEqual(standingsIndex, -1);
  assert.ok(nextEpisodeIndex < standingsIndex);
  assert.doesNotMatch(game, /vote on movie tags/i);
  assert.match(game, /<details/);
  assert.match(game, /1x multiplier/i);
  assert.match(game, /2x multiplier/i);
  assert.match(game, /3x multiplier/i);
  assert.match(game, /Bonus Harley/i);
  assert.match(game, /<Suspense/);
  assert.match(game, /<CurrentRoundErrorBoundary/);
  assert.match(game, /role="status"/);

  const currentRoundBoundary = read(
    "src/app/game/CurrentRoundErrorBoundary.tsx"
  );
  assert.match(currentRoundBoundary, /getDerivedStateFromError/);
  assert.match(currentRoundBoundary, /role="alert"/);
  assert.match(currentRoundBoundary, /QueryErrorResetBoundary/);
  assert.match(currentRoundBoundary, /Try again/);
  assert.match(currentRoundBoundary, /onClick=\{this\.reset\}/);
});

test("deferred analytics and above-fold images avoid runtime console noise", () => {
  const year = read("src/app/year/YearPageClient.tsx");
  const movieCard = read("src/components/MovieCard.tsx");
  const about = read("src/app/about/page.tsx");

  assert.match(year, /enabled:\s*status === "authenticated"/);
  assert.match(year, /priority=\{index === 0\}/);
  assert.doesNotMatch(year, /type ViewMode = "grid" \| "table"/);
  assert.match(year, /router\.replace/);
  assert.match(year, /episodes\.some\([\s\S]*episode\.id === itemEpisode\.id/);
  assert.match(year, /role="group"\s+aria-label="View"/);
  assert.match(year, /review\.rating\.name/);
  assert.match(movieCard, /priority\?: boolean/);
  assert.match(about, /priority/);
});

test("history, about, and footer implement the approved content and accessibility guidance", () => {
  const history = read("src/app/history/page.tsx");
  assert.match(history, /Match close spellings/);
  assert.match(history, /Browse all episodes/);
  assert.match(history, /flex-col[^"\n]*sm:flex-row/);
  const emptyStateIndex = history.indexOf("if (!query)");
  const loadingStateIndex = history.indexOf("if (isLoading)");
  assert.notEqual(emptyStateIndex, -1);
  assert.notEqual(loadingStateIndex, -1);
  assert.ok(emptyStateIndex < loadingStateIndex);
  assert.match(history, /return \(\s*<ul/);
  assert.match(history, /router\.push\([\s\S]*?\{ scroll: false \}\)/);

  const about = read("src/app/about/page.tsx");
  assert.doesNotMatch(about, /Generated by AI/i);
  assert.doesNotMatch(about, /the the woods/i);
  assert.match(about, /bad-ghibli-boys\.png/);

  const footer = read("src/components/ListenHere.tsx");
  assert.match(footer, /grid grid-cols-2/);
  assert.match(footer, /SiSpotify/);
  assert.doesNotMatch(footer, /<svg/);
});

test("game participation keeps Quotabunga available without prediction assignments", () => {
  const episode = read("src/components/Episode.tsx");
  const participation = read("src/components/GameParticipation.tsx");

  assert.doesNotMatch(
    episode,
    /showGames\s*&&\s*predictionAssignments\.length\s*>\s*0/
  );
  assert.match(participation, /assignments\.length\s*>\s*0\s*&&/);
  assert.ok(
    participation.indexOf("assignments.length > 0") <
      participation.indexOf("<QuotabungaSubmission")
  );
});

test("voice message query distinguishes loading, error, and no upcoming episode", () => {
  const leaveMessage = read("src/components/LeaveMessage.tsx");

  assert.match(leaveMessage, /isLoading/);
  assert.match(leaveMessage, /isError/);
  assert.match(leaveMessage, /No upcoming episode/i);
  assert.doesNotMatch(
    leaveMessage,
    /episode\s*\?\s*\([\s\S]*Loading episode details/
  );
});

test("latest movie previews declare their rendered responsive sizes", () => {
  const moviePreview = read("src/components/MovieInlinePreview.tsx");
  const latestEpisode = read("src/components/LatestEpisode.tsx");

  assert.match(moviePreview, /sizes\?: string/);
  assert.match(moviePreview, /sizes=\{sizes\}/);
  assert.equal(
    (latestEpisode.match(/sizes="\(max-width: 639px\) 72px, 108px"/g) ?? [])
      .length,
    2
  );
});

test("authenticated mobile navigation mirrors active route semantics", () => {
  const nav = read("src/components/NavMenu.tsx");
  const mobileAuthStart = nav.indexOf(
    "{authNavItems",
    nav.indexOf("Mobile dropdown")
  );
  const mobileAuthEnd = nav.indexOf("{isLoggedIn ?", mobileAuthStart);
  assert.notEqual(mobileAuthStart, -1);
  assert.notEqual(mobileAuthEnd, -1);
  const mobileAuthNav = nav.slice(mobileAuthStart, mobileAuthEnd);

  assert.match(
    mobileAuthNav,
    /aria-current=\{isActive\(item\.href\) \? "page" : undefined\}/
  );
  assert.match(mobileAuthNav, /bg-red-500\/10 text-red-300/);
});

test("year ranking candidates are movie-grouped, labelled, and submit once", () => {
  const year = read("src/app/year/YearPageClient.tsx");

  assert.match(year, /const rankingCandidates = groupedMovies/);
  assert.match(year, /rankingCandidates\.map\(\(group\)/);
  assert.match(year, /htmlFor="ranked-list-selector"/);
  assert.match(year, /id="ranked-list-selector"/);
  assert.match(year, /htmlFor=\{`rank-select-\$\{group\.movie\.id\}`\}/);
  assert.match(year, /id=\{`rank-select-\$\{group\.movie\.id\}`\}/);
  assert.match(year, /key=\{`\$\{selectedListId\}:\$\{group\.movie\.id\}:/);
  assert.match(year, /currentRank \?\? "unranked"/);
  assert.match(year, /const existingItem = selectedList\.rankedItem\.find/);
  assert.doesNotMatch(year, /rankedItem\.some\([\s\S]{0,200}movieId/);
  assert.doesNotMatch(
    year,
    /<select[\s\S]{0,500}onChange=\{\(e\) => \{[\s\S]{0,300}upsertItem\.mutate/
  );
  assert.equal(
    (year.match(/onSuccess:\s*\(_data, variables\)/g) ?? []).length,
    2
  );
  assert.match(
    year,
    /onMutate:\s*\(\) => \(\{ rankedListId: selectedListId \}\)/
  );
  assert.match(year, /invalidateRankedLists\(context\?\.rankedListId\)/);
});

test("ranked-item updates plan an atomic move instead of duplicating a movie", async () => {
  const { planRankedItemUpsert } = await import(
    "../src/server/api/routers/rankedListUpsertPlan.mjs"
  );
  const items = [
    { id: "movie-a", rank: 2, movieId: "a", showId: null, episodeId: null },
    { id: "movie-b", rank: 3, movieId: "b", showId: null, episodeId: null },
  ];

  assert.deepEqual(
    planRankedItemUpsert(items, {
      movieId: "a",
      showId: undefined,
      episodeId: undefined,
      rank: 3,
    }),
    {
      kind: "move",
      itemId: "movie-a",
      fromRank: 2,
      toRank: 3,
      displacedItemId: "movie-b",
    }
  );
  assert.deepEqual(planRankedItemUpsert(items, { movieId: "new", rank: 3 }), {
    kind: "replace",
    itemId: "movie-b",
  });
  assert.throws(
    () => planRankedItemUpsert(items, { rank: 1 }),
    /Exactly one ranked-item target/
  );

  const router = read("src/server/api/routers/rankedListRouter.ts");
  assert.match(router, /planRankedItemUpsert/);
  assert.match(router, /\$transaction\(async/);
});
