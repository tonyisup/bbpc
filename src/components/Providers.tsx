'use client';

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { type Session } from "next-auth";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";

const PostHogProviderDynamic = dynamic(
  () => import("./PostHogProvider").then((m) => m.PostHogProvider),
  { ssr: false }
);

export function Providers({
  children,
  session,
  headers,
}: {
  children: React.ReactNode;
  session: Session | null;
  headers?: Headers;
}) {
  return (
    <SessionProvider session={session}>
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
    </SessionProvider>
  );
} 