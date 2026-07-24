import "server-only";

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

export async function fetchPublicQuery<Args extends DefaultFunctionArgs>(
  query: ReturnType<typeof publicQueryReference<Args>>,
  args: Args
): Promise<unknown> {
  if (env.NEXT_PUBLIC_BBPC_BACKEND !== "convex") {
    throw new Error(
      "Convex queries are disabled while NEXT_PUBLIC_BBPC_BACKEND is not convex."
    );
  }

  const url = env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error("Convex mode requires NEXT_PUBLIC_CONVEX_URL.");
  }

  const argsAndOptions = [args, { url }] as unknown as ArgsAndOptions<
    typeof query,
    NextjsOptions
  >;
  return fetchQuery(query, ...argsAndOptions);
}
