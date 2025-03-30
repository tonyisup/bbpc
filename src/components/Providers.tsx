'use client';

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { type Session } from "next-auth";
import { PostHogProvider } from "./PostHogProvider";
import { ThemeProvider } from "next-themes";
import SideBarProvider from "./SideBarProvider";
export function Providers({
  children,
  session,
  headers,
}: {
  children: React.ReactNode;
  session: Session | null;
  headers: Headers;
}) {
  return (
    <SessionProvider session={session}>
      <TRPCReactProvider headers={headers}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <PostHogProvider>
            <SideBarProvider>
              {children}
            </SideBarProvider>
          </PostHogProvider>
        </ThemeProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
} 