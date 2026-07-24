"use client";

import { useClerk, useUser as useClerkUser } from "@clerk/nextjs";
import {
  signIn as signInWithNextAuth,
  signOut as signOutWithNextAuth,
  useSession,
} from "next-auth/react";
import { useConvex, useConvexAuth } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  type ConvexIdentityIssue,
  type ConvexIdentityProfile,
  getConvexIdentityIssue,
  resolveConvexIdentity,
} from "@/convex/identity";

export type BbpcAuthStatus = "loading" | "authenticated" | "unauthenticated";
export type BbpcAccountStatus =
  | "not-applicable"
  | "resolving"
  | "ready"
  | "action-required"
  | "unavailable";

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
  accountStatus: BbpcAccountStatus;
  accountIssue: ConvexIdentityIssue | null;
  user: BbpcAuthUser | null;
  signIn: () => void;
  signOut: () => void;
  refreshAccount: () => void;
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
  const refreshAccount = useCallback(() => undefined, []);
  const value = useMemo<BbpcAuthState>(
    () => ({
      backend: "sql",
      status,
      accountStatus:
        status === "loading"
          ? "resolving"
          : session?.user
          ? "ready"
          : "not-applicable",
      accountIssue: null,
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
      refreshAccount,
    }),
    [refreshAccount, session, signIn, signOut, status]
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
  const convex = useConvex();
  const {
    isAuthenticated: isConvexAuthenticated,
    isLoading: isConvexAuthLoading,
  } = useConvexAuth();
  const [profile, setProfile] = useState<ConvexIdentityProfile | null>(null);
  const [accountIssue, setAccountIssue] = useState<ConvexIdentityIssue | null>(
    null
  );
  const [resolutionRevision, setResolutionRevision] = useState(0);
  const attemptedSessionRef = useRef<string | null>(null);
  const activeSessionRef = useRef<string | null>(null);
  const resolutionGenerationRef = useRef(0);
  const clerkUserId = user?.id ?? null;

  useEffect(() => {
    activeSessionRef.current = clerkUserId;
    if (!isLoaded || !isSignedIn || clerkUserId === null) {
      attemptedSessionRef.current = null;
      resolutionGenerationRef.current += 1;
      setProfile(null);
      setAccountIssue(null);
      return;
    }
    if (isConvexAuthLoading) {
      return;
    }
    if (!isConvexAuthenticated) {
      attemptedSessionRef.current = null;
      resolutionGenerationRef.current += 1;
      setProfile(null);
      setAccountIssue("unavailable");
      return;
    }

    // The Clerk user ID is only a local session-attempt key. Canonical
    // ownership always comes from the Convex profile returned below.
    const attemptKey = clerkUserId;
    if (attemptedSessionRef.current === attemptKey) {
      return;
    }
    attemptedSessionRef.current = attemptKey;
    const resolutionGeneration = resolutionGenerationRef.current + 1;
    resolutionGenerationRef.current = resolutionGeneration;
    setProfile(null);
    setAccountIssue(null);

    void resolveConvexIdentity(convex)
      .then((resolvedProfile) => {
        if (
          activeSessionRef.current === attemptKey &&
          resolutionGenerationRef.current === resolutionGeneration
        ) {
          setProfile(resolvedProfile);
        }
      })
      .catch((error: unknown) => {
        if (
          activeSessionRef.current === attemptKey &&
          resolutionGenerationRef.current === resolutionGeneration
        ) {
          setAccountIssue(getConvexIdentityIssue(error));
        }
      });
  }, [
    clerkUserId,
    convex,
    isConvexAuthLoading,
    isConvexAuthenticated,
    isLoaded,
    isSignedIn,
    resolutionRevision,
  ]);

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
  const refreshAccount = useCallback(() => {
    attemptedSessionRef.current = null;
    setResolutionRevision((revision) => revision + 1);
  }, []);
  const value = useMemo<BbpcAuthState>(() => {
    const status: BbpcAuthStatus =
      !isLoaded || (isSignedIn && isConvexAuthLoading)
        ? "loading"
        : isSignedIn
        ? "authenticated"
        : "unauthenticated";
    const hasActionRequiredIssue =
      accountIssue === "account-disabled" ||
      accountIssue === "identity-conflict";

    return {
      backend: "convex",
      status,
      accountStatus: !isSignedIn
        ? "not-applicable"
        : profile !== null
        ? "ready"
        : accountIssue === null
        ? "resolving"
        : hasActionRequiredIssue
        ? "action-required"
        : "unavailable",
      accountIssue,
      user:
        isLoaded && isSignedIn
          ? {
              // Canonical Convex user IDs are resolved by authenticated
              // backend functions. A Clerk subject must never be used as
              // an application-data foreign key.
              appUserId: profile?.id ?? null,
              name:
                profile?.name ??
                user.fullName ??
                user.username ??
                user.primaryEmailAddress?.emailAddress ??
                null,
              email:
                profile?.email ??
                user.primaryEmailAddress?.emailAddress ??
                null,
              image: profile?.image ?? user.imageUrl ?? null,
              isAdmin: profile?.isAdmin ?? false,
              isImpersonating: false,
            }
          : null,
      signIn,
      signOut,
      refreshAccount,
    };
  }, [
    accountIssue,
    isConvexAuthLoading,
    isLoaded,
    isSignedIn,
    profile,
    refreshAccount,
    signIn,
    signOut,
    user,
  ]);

  return (
    <BbpcAuthContext.Provider value={value}>
      {children}
    </BbpcAuthContext.Provider>
  );
}
