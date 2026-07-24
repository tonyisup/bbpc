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
const middleware = await readFile(
  new URL("../src/middleware.ts", import.meta.url),
  "utf8"
);
const layout = await readFile(
  new URL("../src/app/layout.tsx", import.meta.url),
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
const profilePage = await readFile(
  new URL("../src/app/profile/page.tsx", import.meta.url),
  "utf8"
);
const convexProfilePage = await readFile(
  new URL("../src/app/profile/ConvexProfilePage.tsx", import.meta.url),
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

test("the SQL-default consumer scaffold pins and fail-closes Clerk plus Convex", () => {
  assert.equal(packageJson.dependencies["@clerk/nextjs"], "6.39.6");
  assert.equal(packageJson.dependencies.convex, "1.42.3");
  assert.match(
    providers,
    /NEXT_PUBLIC_BBPC_BACKEND !== "convex"[\s\S]*<SessionProvider[\s\S]*<SqlBbpcAuthProvider/u
  );
  assert.match(
    providers,
    /<ClerkProvider[\s\S]*<ConvexProviderWithClerk[\s\S]*<ClerkBbpcAuthProvider/u
  );
  assert.match(
    providers,
    /<ClerkBbpcAuthProvider>[\s\S]*<SessionProvider session=\{null\}>/u
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
  assert.match(
    layout,
    /NEXT_PUBLIC_BBPC_BACKEND === "convex"[\s\S]*\? null[\s\S]*getServerAuthSession/u
  );
  assert.doesNotMatch(
    layout,
    /import \{ getServerAuthSession \} from "@\/server\/auth"/u
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
});

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
});
