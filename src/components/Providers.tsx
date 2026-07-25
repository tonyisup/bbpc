"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { type Session } from "next-auth";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";
import {
  ClerkBbpcAuthProvider,
  SqlBbpcAuthProvider,
} from "@/components/auth/BbpcAuthContext";

const PostHogProviderDynamic = dynamic(
  () => import("./PostHogProvider").then((m) => m.PostHogProvider),
  { ssr: false }
);

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient =
  convexUrl === undefined ? null : new ConvexReactClient(convexUrl);

function SharedProviders({
  children,
  headers,
}: {
  children: React.ReactNode;
  headers?: Headers;
}) {
  return (
    <TRPCReactProvider headers={headers}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {process.env.NEXT_PUBLIC_POSTHOG_KEY ? (
          <PostHogProviderDynamic>
            {children}
            <Toaster />
          </PostHogProviderDynamic>
        ) : (
          <>
            {children}
            <Toaster />
          </>
        )}
      </ThemeProvider>
    </TRPCReactProvider>
  );
}

export function Providers({
  children,
  session,
  headers,
}: {
  children: React.ReactNode;
  session: Session | null;
  headers?: Headers;
}) {
  const shared = (
    <SharedProviders headers={headers}>{children}</SharedProviders>
  );

  if (process.env.NEXT_PUBLIC_BBPC_BACKEND !== "convex") {
    return (
      <SessionProvider session={session}>
        <SqlBbpcAuthProvider>{shared}</SqlBbpcAuthProvider>
      </SessionProvider>
    );
  }

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (publishableKey === undefined || convexClient === null) {
    throw new Error(
      "Convex mode requires NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and NEXT_PUBLIC_CONVEX_URL."
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        <ClerkBbpcAuthProvider>{shared}</ClerkBbpcAuthProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
