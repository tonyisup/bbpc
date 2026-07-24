import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(
    new URL("../package.json", import.meta.url),
    "utf8",
  ),
);
const providers = await readFile(
  new URL(
    "../src/components/Providers.tsx",
    import.meta.url,
  ),
  "utf8",
);
const middleware = await readFile(
  new URL("../src/middleware.ts", import.meta.url),
  "utf8",
);
const exampleEnv = await readFile(
  new URL("../.env.example", import.meta.url),
  "utf8",
);

test("the SQL-default consumer scaffold pins and fail-closes Clerk plus Convex", () => {
  assert.equal(
    packageJson.dependencies["@clerk/nextjs"],
    "6.39.6",
  );
  assert.equal(packageJson.dependencies.convex, "1.42.3");
  assert.match(
    providers,
    /<ClerkProvider[\s\S]*<ConvexProviderWithClerk[\s\S]*<SessionProvider/u,
  );
  assert.match(
    providers,
    /NEXT_PUBLIC_BBPC_BACKEND !== "convex"/u,
  );
  assert.match(
    providers,
    /Convex mode requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and NEXT_PUBLIC_CONVEX_URL/u,
  );
  assert.match(
    middleware,
    /NEXT_PUBLIC_BBPC_BACKEND !== "convex"[\s\S]*NextResponse\.next/u,
  );
  assert.match(
    middleware,
    /process\.env\.CLERK_SECRET_KEY === undefined/u,
  );
  assert.match(
    exampleEnv,
    /NEXT_PUBLIC_BBPC_BACKEND=sql/u,
  );
  assert.match(
    exampleEnv,
    /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[\r\n]/u,
  );
  assert.match(exampleEnv, /CLERK_SECRET_KEY=[\r\n]/u);
  assert.match(exampleEnv, /NEXT_PUBLIC_CONVEX_URL=[\r\n]/u);
});
