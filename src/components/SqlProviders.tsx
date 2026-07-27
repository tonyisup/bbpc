"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { SqlBbpcAuthProvider } from "@/components/auth/SqlBbpcAuthProvider";
import { TRPCReactProvider } from "@/trpc/react";

export interface SqlProvidersProps {
  children: React.ReactNode;
  session: Session | null;
  headers?: Headers;
}

export default function SqlProviders({
  children,
  session,
  headers,
}: SqlProvidersProps) {
  return (
    <TRPCReactProvider headers={headers}>
      <SessionProvider session={session}>
        <SqlBbpcAuthProvider>{children}</SqlBbpcAuthProvider>
      </SessionProvider>
    </TRPCReactProvider>
  );
}
