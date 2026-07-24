"use client";

import {
  PredictionGame,
  type PredictionGameAssignment,
} from "@/components/PredictionGame";
import QuotabungaSubmission from "@/components/QuotabungaSubmission";
import { Button } from "@/components/ui/button";
import { useBbpcAuth } from "@/components/auth/BbpcAuthContext";

interface GameParticipationProps {
  assignments: PredictionGameAssignment[];
  episodeStatus: string;
  searchQuery?: string;
}

export function GameParticipation({
  assignments,
  episodeStatus,
  searchQuery = "",
}: GameParticipationProps) {
  const { backend, signIn, status, user } = useBbpcAuth();

  if (status === "loading") {
    return (
      <div
        className="h-24 animate-pulse rounded-lg bg-white/[0.04]"
        aria-label="Loading game"
      />
    );
  }

  if (!user) {
    return (
      <section className="mt-5 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-5 text-center">
        <h3 className="text-lg font-bold text-white">
          Make your picks and submit a quote
        </h3>
        <p className="mx-auto mt-1 max-w-lg text-sm text-zinc-300">
          One account unlocks both parts of this week&apos;s listener game.
        </p>
        <Button className="mt-4 whitespace-nowrap" onClick={signIn}>
          Sign in to play
        </Button>
      </section>
    );
  }

  if (backend === "convex") {
    return (
      <section className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-5 text-center">
        <h3 className="text-lg font-bold text-white">
          Game submissions are temporarily read-only
        </h3>
        <p className="mx-auto mt-1 max-w-lg text-sm text-zinc-300">
          Your Clerk session is active. Prediction and Quotabunga writes will
          reopen after the account-linking workflow is enabled for cutover.
        </p>
      </section>
    );
  }

  if (user.appUserId === null) {
    return (
      <div className="mt-5 text-center text-red-300" role="alert">
        Your account could not be resolved. Please sign in again.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      {assignments.length > 0 && (
        <PredictionGame
          assignments={assignments}
          userId={user.appUserId}
          searchQuery={searchQuery}
          episodeStatus={episodeStatus}
        />
      )}
      <QuotabungaSubmission />
    </div>
  );
}
