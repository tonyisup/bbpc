'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";

const PostHogProviderDynamic = dynamic(
  () => import("./PostHogProvider").then((m) => m.PostHogProvider),
  { ssr: false }
);

export function Providers({
  children,
  headers,
}: {
  children: React.ReactNode;
  headers?: Headers;
}) {
  return (
    <ClerkProvider>
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
    </ClerkProvider>
  );
}
