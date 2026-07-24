"use client";

import { useClerk, useUser as useClerkUser } from "@clerk/nextjs";
import {
  signIn as signInWithNextAuth,
  signOut as signOutWithNextAuth,
  useSession,
} from "next-auth/react";
import { createContext, useCallback, useContext, useMemo } from "react";

export type BbpcAuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface BbpcAuthUser {
  appUserId: string | null;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin: boolean;
  isImpersonating: boolean;
}

export interface BbpcAuthState {
  backend: "sql" | "convex";
  status: BbpcAuthStatus;
  user: BbpcAuthUser | null;
  signIn: () => void;
  signOut: () => void;
}

const BbpcAuthContext = createContext<BbpcAuthState | null>(null);

export function useBbpcAuth(): BbpcAuthState {
  const value = useContext(BbpcAuthContext);
  if (value === null) {
    throw new Error("useBbpcAuth must be used inside the BBPC providers.");
  }
  return value;
}

export function SqlBbpcAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const signIn = useCallback(() => {
    void signInWithNextAuth();
  }, []);
  const signOut = useCallback(() => {
    void signOutWithNextAuth({
      callbackUrl: window.location.pathname,
    });
  }, []);
  const value = useMemo<BbpcAuthState>(
    () => ({
      backend: "sql",
      status,
      user: session?.user
        ? {
            appUserId: session.user.id,
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
            isAdmin: session.user.isAdmin,
            isImpersonating: session.user.isImpersonating ?? false,
          }
        : null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut, status]
  );

  return (
    <BbpcAuthContext.Provider value={value}>
      {children}
    </BbpcAuthContext.Provider>
  );
}

export function ClerkBbpcAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerk = useClerk();
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const signIn = useCallback(() => {
    void clerk.redirectToSignIn({
      redirectUrl: window.location.href,
    });
  }, [clerk]);
  const signOut = useCallback(() => {
    void clerk.signOut({
      redirectUrl: window.location.pathname,
    });
  }, [clerk]);
  const value = useMemo<BbpcAuthState>(
    () => ({
      backend: "convex",
      status: !isLoaded
        ? "loading"
        : isSignedIn
        ? "authenticated"
        : "unauthenticated",
      user:
        isLoaded && isSignedIn
          ? {
              // Canonical Convex user IDs are resolved by authenticated
              // backend functions. A Clerk subject must never be used as
              // an application-data foreign key.
              appUserId: null,
              name:
                user.fullName ??
                user.username ??
                user.primaryEmailAddress?.emailAddress ??
                null,
              email: user.primaryEmailAddress?.emailAddress ?? null,
              image: user.imageUrl ?? null,
              isAdmin: false,
              isImpersonating: false,
            }
          : null,
      signIn,
      signOut,
    }),
    [isLoaded, isSignedIn, signIn, signOut, user]
  );

  return (
    <BbpcAuthContext.Provider value={value}>
      {children}
    </BbpcAuthContext.Provider>
  );
}
