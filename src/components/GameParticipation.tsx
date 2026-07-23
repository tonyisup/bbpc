"use client";

import { signIn, useSession } from "next-auth/react";

import {
  PredictionGame,
  type PredictionGameAssignment,
} from "@/components/PredictionGame";
import QuotabungaSubmission from "@/components/QuotabungaSubmission";
import { Button } from "@/components/ui/button";

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
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div
        className="h-24 animate-pulse rounded-lg bg-white/[0.04]"
        aria-label="Loading game"
      />
    );
  }

  if (!session?.user) {
    return (
      <section className="mt-5 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-5 text-center">
        <h3 className="text-lg font-bold text-white">
          Make your picks and submit a quote
        </h3>
        <p className="mx-auto mt-1 max-w-lg text-sm text-zinc-300">
          One account unlocks both parts of this week&apos;s listener game.
        </p>
        <Button
          className="mt-4 whitespace-nowrap"
          onClick={() => void signIn()}
        >
          Sign in to play
        </Button>
      </section>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      {assignments.length > 0 && (
        <PredictionGame
          assignments={assignments}
          userId={session.user.id}
          searchQuery={searchQuery}
          episodeStatus={episodeStatus}
        />
      )}
      <QuotabungaSubmission />
    </div>
  );
}
