'use client';

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { type Session } from "next-auth";

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
        {children}
      </TRPCReactProvider>
    </SessionProvider>
  );
} 