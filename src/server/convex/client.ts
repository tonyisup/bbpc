import "server-only";

import { isClerkAPIResponseError } from "@clerk/nextjs/errors";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import {
  makeFunctionReference,
  type ArgsAndOptions,
  type DefaultFunctionArgs,
} from "convex/server";
import type { NextjsOptions } from "convex/nextjs";

import { env } from "@/env.mjs";

export const publicQueryReference = <Args extends DefaultFunctionArgs>(
  name: string
) => makeFunctionReference<"query", Args, unknown>(name);

function requireConvexUrl(): string {
  if (env.NEXT_PUBLIC_BBPC_BACKEND !== "convex") {
    throw new Error(
      "Convex queries are disabled while NEXT_PUBLIC_BBPC_BACKEND is not convex."
    );
  }

  const url = env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("Convex mode requires NEXT_PUBLIC_CONVEX_URL.");
  }
  return url;
}

function queryArgs<Args extends DefaultFunctionArgs>(
  query: ReturnType<typeof publicQueryReference<Args>>,
  args: Args,
  options: NextjsOptions
) {
  return [args, options] as unknown as ArgsAndOptions<
    typeof query,
    NextjsOptions
  >;
}

export async function fetchPublicQuery<Args extends DefaultFunctionArgs>(
  query: ReturnType<typeof publicQueryReference<Args>>,
  args: Args
): Promise<unknown> {
  return fetchQuery(
    query,
    ...queryArgs(query, args, {
      url: requireConvexUrl(),
    })
  );
}

async function retryClerkNotFound<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!isClerkAPIResponseError(error) || error.status !== 404) {
      throw error;
    }
  }

  // A newly completed Clerk sign-up can briefly precede session-token
  // propagation to the Backend API.
  await new Promise((resolve) => setTimeout(resolve, 250));

  try {
    return await operation();
  } catch (error) {
    if (!isClerkAPIResponseError(error) || error.status !== 404) {
      throw error;
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  return operation();
}

async function getOptionalConvexToken(): Promise<string | null> {
  const clerkAuth = await auth();
  if (clerkAuth.userId === null) {
    return null;
  }
  const token = await retryClerkNotFound(() =>
    clerkAuth.sessionClaims?.aud === "convex"
      ? clerkAuth.getToken()
      : clerkAuth.getToken({ template: "convex" })
  );
  if (token === null) {
    throw new Error(
      "Clerk is authenticated but did not provide a Convex token."
    );
  }
  return token;
}

export async function fetchQueryForSignedInUser<
  Args extends DefaultFunctionArgs
>(
  query: ReturnType<typeof publicQueryReference<Args>>,
  args: Args
): Promise<unknown | null> {
  const url = requireConvexUrl();
  const token = await getOptionalConvexToken();
  if (token === null) {
    return null;
  }
  return fetchQuery(query, ...queryArgs(query, args, { url, token }));
}
