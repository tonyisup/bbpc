import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8")
);
const providers = await readFile(
  new URL("../src/components/Providers.tsx", import.meta.url),
  "utf8"
);
const sqlProviders = await readFile(
  new URL("../src/components/SqlProviders.tsx", import.meta.url),
  "utf8"
);
const sqlAuthProvider = await readFile(
  new URL(
    "../src/components/auth/SqlBbpcAuthProvider.tsx",
    import.meta.url
  ),
  "utf8"
);
const middleware = await readFile(
  new URL("../src/middleware.ts", import.meta.url),
  "utf8"
);
const layout = await readFile(
  new URL("../src/app/layout.tsx", import.meta.url),
  "utf8"
);
const accountRecoveryBanner = await readFile(
  new URL(
    "../src/components/ConvexAccountRecoveryBanner.tsx",
    import.meta.url
  ),
  "utf8"
);
const authContext = await readFile(
  new URL("../src/components/auth/BbpcAuthContext.tsx", import.meta.url),
  "utf8"
);
const exampleEnv = await readFile(
  new URL("../.env.example", import.meta.url),
  "utf8"
);
const runtimeEnv = await readFile(
  new URL("../src/env.mjs", import.meta.url),
  "utf8"
);
const serverEnvSchema = await readFile(
  new URL("../src/env/schema.mjs", import.meta.url),
  "utf8"
);
const profilePage = await readFile(
  new URL("../src/app/profile/page.tsx", import.meta.url),
  "utf8"
);
const convexProfilePage = await readFile(
  new URL("../src/app/profile/ConvexProfilePage.tsx", import.meta.url),
  "utf8"
);
const convexProfileForm = await readFile(
  new URL("../src/app/profile/ConvexProfileForm.tsx", import.meta.url),
  "utf8"
);
const convexProfileAdapter = await readFile(
  new URL("../src/convex/profile.ts", import.meta.url),
  "utf8"
);
const convexIdentityAdapter = await readFile(
  new URL("../src/convex/identity.ts", import.meta.url),
  "utf8"
);
const uploadRoute = await readFile(
  new URL("../src/app/api/uploadthing/route.ts", import.meta.url),
  "utf8"
);
const convexUploadRouter = await readFile(
  new URL(
    "../src/server/upload/convexUploadthing.ts",
    import.meta.url
  ),
  "utf8"
);
const leaveMessage = await readFile(
  new URL("../src/components/LeaveMessage.tsx", import.meta.url),
  "utf8"
);
const convexVoiceMailRecorder = await readFile(
  new URL(
    "../src/components/ConvexVoiceMailRecorder.tsx",
    import.meta.url
  ),
  "utf8"
);
const addExtraToNext = await readFile(
  new URL("../src/components/AddExtraToNext.tsx", import.meta.url),
  "utf8"
);
const gameParticipation = await readFile(
  new URL("../src/components/GameParticipation.tsx", import.meta.url),
  "utf8"
);
const navMenu = await readFile(
  new URL("../src/components/NavMenu.tsx", import.meta.url),
  "utf8"
);
const convexImpersonationControl = await readFile(
  new URL(
    "../src/components/ConvexImpersonationControl.tsx",
    import.meta.url
  ),
  "utf8"
);
const convexImpersonationAdapter = await readFile(
  new URL("../src/convex/impersonation.ts", import.meta.url),
  "utf8"
);
const publicHomePage = await readFile(
  new URL("../src/app/page.tsx", import.meta.url),
  "utf8"
);
const publicEpisodesPage = await readFile(
  new URL("../src/app/episodes/page.tsx", import.meta.url),
  "utf8"
);
const publicEpisodeDetailPage = await readFile(
  new URL("../src/app/episodes/[slug]/page.tsx", import.meta.url),
  "utf8"
);
const publicSitemap = await readFile(
  new URL("../src/app/sitemap.ts", import.meta.url),
  "utf8"
);
const publicSlugResolver = await readFile(
  new URL("../src/server/slugs.ts", import.meta.url),
  "utf8"
);
const legacyAuthRoute = await readFile(
  new URL("../src/app/api/auth/[...nextauth]/route.ts", import.meta.url),
  "utf8"
);
const legacyTrpcRoute = await readFile(
  new URL("../src/app/api/trpc/[trpc]/route.ts", import.meta.url),
  "utf8"
);
const legacyRestrictedRoute = await readFile(
  new URL("../src/app/api/restricted/route.ts", import.meta.url),
  "utf8"
);

test("the SQL-default consumer scaffold pins and fail-closes Clerk plus Convex", () => {
  assert.equal(packageJson.dependencies["@clerk/nextjs"], "6.39.6");
  assert.equal(packageJson.dependencies.convex, "1.42.3");
  assert.match(
    providers,
    /NEXT_PUBLIC_BBPC_BACKEND !== "convex"[\s\S]*<SqlProviders/u
  );
  assert.doesNotMatch(
    providers,
    /next-auth\/react|TRPCReactProvider|SqlBbpcAuthProvider/u
  );
  assert.match(
    sqlProviders,
    /<TRPCReactProvider[\s\S]*<SessionProvider[\s\S]*<SqlBbpcAuthProvider/u
  );
  assert.match(sqlAuthProvider, /useSession[\s\S]*BbpcAuthStateProvider/u);
  assert.match(
    providers,
    /<ClerkProvider[\s\S]*<ConvexProviderWithClerk[\s\S]*<ClerkBbpcAuthProvider/u
  );
  assert.match(
    providers,
    /<ClerkBbpcAuthProvider>\{shared\}<\/ClerkBbpcAuthProvider>/u
  );
  const convexProviderBranch = providers.slice(
    providers.indexOf("const publishableKey"),
  );
  assert.doesNotMatch(
    convexProviderBranch,
    /SqlProviders|TRPCReactProvider|SessionProvider/u
  );
  assert.match(
    leaveMessage,
    /function SqlMessageContent[\s\S]*api\.episode\.next\.useQuery/u
  );
  assert.match(
    leaveMessage,
    /backend === "convex"[\s\S]*<ConvexVoiceMailRecorder enabled=\{isModalOpen\} \/>[\s\S]*<SqlMessageContent/u
  );
  assert.match(
    convexVoiceMailRecorder,
    /episodes\/public:nextScheduled[\s\S]*episodes\/audio:listMine[\s\S]*episodes\/audio:createMine[\s\S]*episodes\/audio:discardMyUpload/u
  );
  assert.match(
    convexVoiceMailRecorder,
    /useUploadThing\("audioUploader"\)[\s\S]*BBPC_CLIENT_API_VERSION/u
  );
  assert.doesNotMatch(
    convexVoiceMailRecorder,
    /trpc|next-auth|@prisma|DATABASE_URL/u
  );
  assert.match(
    addExtraToNext,
    /function SqlAddExtraToNext[\s\S]*api\.auth\.isHost\.useQuery/u
  );
  assert.match(
    addExtraToNext,
    /backend === "convex"[\s\S]*user\?\.isHost === true[\s\S]*<SqlAddExtraToNext/u
  );
  assert.match(
    gameParticipation,
    /useState\(false\)[\s\S]*setMounted\(true\)[\s\S]*!mounted \|\| status === "loading"/u
  );
  assert.match(
    navMenu,
    /useState\(false\)[\s\S]*setMounted\(true\)[\s\S]*visibleUser = mounted \? user : null/u
  );
  assert.match(
    navMenu,
    /dynamic\([\s\S]*import\("\.\/ImpersonationSelector"\)[\s\S]*backend === "sql"[\s\S]*SqlImpersonationSelector/u
  );
  assert.match(
    convexImpersonationAdapter,
    /identity\/impersonation:current[\s\S]*identity\/impersonation:revoke/u
  );
  assert.doesNotMatch(
    `${convexImpersonationControl}\n${convexImpersonationAdapter}`,
    /trpc|next-auth|@prisma/u
  );
  assert.match(
    convexImpersonationControl,
    /Could not end impersonation\. Try again\./u
  );
  assert.match(providers, /NEXT_PUBLIC_BBPC_BACKEND !== "convex"/u);
  assert.match(
    providers,
    /Convex mode requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and NEXT_PUBLIC_CONVEX_URL/u
  );
  assert.match(
    middleware,
    /NEXT_PUBLIC_BBPC_BACKEND !== "convex"[\s\S]*NextResponse\.next/u
  );
  assert.match(middleware, /process\.env\.CLERK_SECRET_KEY === undefined/u);
  assert.match(middleware, /const authorizedParties/u);
  assert.match(
    middleware,
    /https:\/\/badboyspodcast\.com[\s\S]*https:\/\/www\.badboyspodcast\.com/u
  );
  assert.match(middleware, /process\.env\.VERCEL_URL/u);
  assert.match(middleware, /http:\/\/localhost:3000/u);
  assert.match(
    middleware,
    /clerkMiddleware\(\{ authorizedParties \}\)/u
  );
  assert.match(
    middleware,
    /pathname\.startsWith\("\/api\/auth"\)[\s\S]*pathname\.startsWith\("\/api\/trpc"\)[\s\S]*status: 404/u
  );
  assert.match(
    layout,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*\? null[\s\S]*getServerAuthSession/u
  );
  assert.doesNotMatch(
    layout,
    /import \{ getServerAuthSession \} from "@\/server\/auth"/u
  );
  assert.match(layout, /<ConvexAccountRecoveryBanner \/>/u);
  assert.match(
    accountRecoveryBanner,
    /accountStatus === "ready"[\s\S]*accountStatus === "resolving"[\s\S]*Sign out to use a different email[\s\S]*onClick=\{signOut\}/u
  );
  assert.match(
    authContext,
    /A Clerk subject must never be used as[\s\S]*an application-data foreign key/u
  );
  assert.match(convexIdentityAdapter, /isHost: z\.boolean\(\)/u);
  assert.match(authContext, /isHost: profile\?\.isHost \?\? false/u);
  assert.match(exampleEnv, /NEXT_PUBLIC_BBPC_BACKEND=sql/u);
  assert.match(exampleEnv, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[\r\n]/u);
  assert.match(exampleEnv, /CLERK_SECRET_KEY=[\r\n]/u);
  assert.match(exampleEnv, /NEXT_PUBLIC_CONVEX_URL=[\r\n]/u);
  expectSqlOnlyEnvironmentIsolation(runtimeEnv);
  expectSqlOnlyEnvironmentIsolation(serverEnvSchema);
  assert.match(runtimeEnv, /DATABASE_URL: sqlRequiredString/u);
  assert.match(runtimeEnv, /GOOGLE_CLIENT_ID: sqlRequiredString/u);
  assert.match(runtimeEnv, /GOOGLE_CLIENT_SECRET: sqlRequiredString/u);
  assert.match(serverEnvSchema, /DATABASE_URL: sqlRequiredString/u);
});

/** @param {string} source */
function expectSqlOnlyEnvironmentIsolation(source) {
  assert.match(
    source,
    /NEXT_PUBLIC_BBPC_BACKEND !== "convex"[\s\S]*z\.string\(\)\.min\(1\)[\s\S]*z\.string\(\)\.optional\(\)\.default\(""\)/u
  );
}

test("the profile route cannot fall through to SQL in Convex mode", () => {
  assert.match(
    profilePage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*import\("\.\/ConvexProfilePage"\)/u
  );
  assert.match(profilePage, /import\("\.\/SqlProfilePage"\)/u);
  assert.doesNotMatch(profilePage, /server\/auth|server\/db/u);
  assert.doesNotMatch(convexProfilePage, /next-auth|server\/db|prisma/u);
  assert.match(convexProfilePage, /accountStatus !== "ready"/u);
  assert.match(convexProfilePage, /user\.appUserId === null/u);
  assert.match(convexProfileAdapter, /syllabus\/mine:list/u);
  assert.match(convexProfileAdapter, /games\/member:myAvailablePoints/u);
  assert.match(convexProfileAdapter, /games\/member:myPointsPage/u);
  assert.doesNotMatch(convexProfileAdapter, /userId[\s\S]*client\.query/u);
  assert.match(convexProfileAdapter, /syllabusListSchema[\s\S]*\.parse/u);
  assert.match(convexProfileAdapter, /availablePointsSchema\.parse/u);
  assert.match(convexProfileAdapter, /pointHistoryPageSchema\.parse/u);
  assert.match(
    convexProfileAdapter,
    /paginationOpts: \{[\s\S]*numItems: 20,[\s\S]*cursor/u
  );
  assert.match(
    convexProfileForm,
    /assertConvexProfileImageUploadAllowed[\s\S]*startUpload[\s\S]*updateConvexProfileWithImage/u
  );
  assert.match(
    convexProfileForm,
    /discardConvexProfileImageUpload[\s\S]*automatic cleanup could not be queued/u
  );
  assert.match(
    convexIdentityAdapter,
    /identity\/profile:updateMyProfileWithImage[\s\S]*identity\/profile:discardMyProfileImageUpload/u
  );
  assert.match(
    uploadRoute,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*convexUploadthing[\s\S]*@\/server\/upload\/uploadthing[\s\S]*\.ourFileRouter/u
  );
  assert.match(
    convexUploadRouter,
    /identity\/profile:actionGateProbe[\s\S]*fetchActionForSignedInUser/u
  );
  assert.doesNotMatch(
    convexUploadRouter,
    /server\/auth|server\/db|next-auth|prisma/u
  );
});

test("Convex public route controllers do not statically load SQL or NextAuth", () => {
  for (const source of [
    publicHomePage,
    publicEpisodesPage,
    publicEpisodeDetailPage,
    publicSitemap,
    publicSlugResolver,
  ]) {
    assert.doesNotMatch(
      source,
      /^import .*["']@\/server\/(?:db|auth)["'];?$/mu
    );
  }

  assert.match(
    publicHomePage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getLatestPublishedEpisode/u
  );
  assert.match(publicHomePage, /await import\("@\/server\/db"\)/u);
  assert.match(publicHomePage, /import\("@\/server\/auth"\)/u);
  assert.match(
    publicEpisodesPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory[\s\S]*await import\("@\/server\/db"\)/u
  );
  assert.match(
    publicEpisodeDetailPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory[\s\S]*await import\("@\/server\/db"\)/u
  );
  assert.match(
    publicEpisodeDetailPage,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getEpisodeResults[\s\S]*import\("@\/server\/sql\/episodeResults"\)/u
  );
  assert.match(
    publicSitemap,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*listEpisodeHistory[\s\S]*await import\("@\/server\/db"\)/u
  );
  assert.match(
    publicSlugResolver,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*getEpisodeBySlug[\s\S]*await import\("@\/server\/db"\)/u
  );
});

test("Convex mode rejects legacy API routes before loading their stacks", () => {
  for (const source of [
    legacyAuthRoute,
    legacyTrpcRoute,
    legacyRestrictedRoute,
  ]) {
    assert.match(
      source,
      /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*status: 404[\s\S]*Cache-Control/u
    );
  }

  assert.doesNotMatch(
    legacyAuthRoute,
    /^import .*["'](?:next-auth|@\/server\/auth)["'];?$/mu
  );
  assert.match(
    legacyAuthRoute,
    /Promise\.all\(\[[\s\S]*import\("next-auth"\)[\s\S]*import\("@\/server\/auth"\)/u
  );

  assert.doesNotMatch(
    legacyTrpcRoute,
    /^import .*["'](?:@trpc\/server\/adapters\/fetch|@\/server\/api\/(?:root|trpc))["'];?$/mu
  );
  assert.match(
    legacyTrpcRoute,
    /Promise\.all\(\[[\s\S]*import\("@trpc\/server\/adapters\/fetch"\)[\s\S]*import\("@\/server\/api\/root"\)[\s\S]*import\("@\/server\/api\/trpc"\)/u
  );

  assert.doesNotMatch(
    legacyRestrictedRoute,
    /^import .*["']@\/server\/auth["'];?$/mu
  );
  assert.match(
    legacyRestrictedRoute,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*await import\("@\/server\/auth"\)/u
  );
});
