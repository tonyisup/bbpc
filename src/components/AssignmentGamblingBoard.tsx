"use client";

import { type User } from "@prisma/client";
import { AlertTriangle, Coins } from "lucide-react";
import { type FC } from "react";

import {
  PredictionRoundState,
  getPredictionRoundState,
} from "@/lib/predictionRound.mjs";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import BettingCoin, { type PayoutTone, type WagerInput } from "./BettingCoin";
import RatingIcon from "./RatingIcon";
import { Button } from "./ui/button";

interface AssignmentGamblingBoardProps {
  assignmentId: string;
  hosts: User[];
  guesses: {
    hostId: string;
    ratingId: number;
  }[];
  episodeStatus: string;
}

type WagerOption = {
  lookupId: string;
  label: string;
  description: string;
  targetHostId?: string;
};

const wagerHostIdentifiers = ["mcp", "fonso", "harley"] as const;
type WagerHostIdentifier = (typeof wagerHostIdentifiers)[number];

const fallbackHostNames: Record<WagerHostIdentifier, string> = {
  mcp: "MCP",
  fonso: "Fonso",
  harley: "Harley",
};

const firstName = (host: User | undefined, fallback: string) =>
  host?.name?.split(" ")[0] ?? fallback;

const AssignmentGamblingBoard: FC<AssignmentGamblingBoardProps> = ({
  assignmentId,
  hosts,
  guesses,
  episodeStatus,
}) => {
  const gamblingTypesQuery = api.gambling.getAllActive.useQuery();
  const userPointsQuery = api.user.points.useQuery();
  const betsQuery = api.gambling.getForAssignment.useQuery({ assignmentId });
  const utils = api.useUtils();
  const submitBet = api.gambling.submitPoints.useMutation();
  const isRoundOpen =
    getPredictionRoundState(episodeStatus) === PredictionRoundState.OPEN;

  if (
    gamblingTypesQuery.isLoading ||
    userPointsQuery.isLoading ||
    betsQuery.isLoading
  ) {
    return (
      <div
        className="rounded-lg bg-white/[0.03] p-4 text-sm text-zinc-400"
        role="status"
      >
        Loading wager options…
      </div>
    );
  }

  if (
    gamblingTypesQuery.isError ||
    userPointsQuery.isError ||
    betsQuery.isError
  ) {
    return (
      <div
        className="rounded-lg border border-red-500/30 bg-red-500/[0.08] p-4"
        role="alert"
      >
        <p className="font-bold text-white">Couldn&apos;t load wagering.</p>
        <p className="mt-1 text-sm text-zinc-300">
          Your existing wagers have not been changed.
        </p>
        <Button
          className="mt-3"
          size="sm"
          variant="outline"
          onClick={() => {
            void gamblingTypesQuery.refetch();
            void userPointsQuery.refetch();
            void betsQuery.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const gamblingTypes = gamblingTypesQuery.data ?? [];
  const myBets = betsQuery.data ?? [];
  const userPoints = userPointsQuery.data ?? 0;

  const getBetFor = (lookupId: string, targetHostId?: string) => {
    const type = gamblingTypes.find(
      (candidate) => candidate.lookupId === lookupId
    );
    if (!type) return undefined;
    return myBets.find(
      (bet) =>
        bet.gamblingTypeId === type.id &&
        (targetHostId ? bet.targetUserId === targetHostId : !bet.targetUserId)
    );
  };

  const getTypeFor = (lookupId: string) =>
    gamblingTypes.find((candidate) => candidate.lookupId === lookupId);

  const getHostByIdentifier = (identifier: WagerHostIdentifier) =>
    hosts.find(
      (host) => firstName(host, "").toLowerCase() === identifier.toLowerCase()
    );

  const getHostIdentifiersForLookupId = (
    lookupId: string
  ): WagerHostIdentifier[] => {
    if (lookupId.startsWith("all-rating-guess-")) {
      return [...wagerHostIdentifiers];
    }

    const encodedHosts = lookupId.split("-rating-guess-")[0]?.split("-") ?? [];
    return encodedHosts.filter(
      (identifier): identifier is WagerHostIdentifier =>
        wagerHostIdentifiers.includes(identifier as WagerHostIdentifier)
    );
  };

  const getHostLabelForLookupId = (lookupId: string) =>
    getHostIdentifiersForLookupId(lookupId)
      .map((identifier) =>
        firstName(
          getHostByIdentifier(identifier),
          fallbackHostNames[identifier]
        )
      )
      .join(" + ");

  const getSingleHostForLookupId = (lookupId: string) => {
    const identifier = getHostIdentifiersForLookupId(lookupId)[0];
    return identifier ? getHostByIdentifier(identifier) : undefined;
  };

  const handleSubmit = async (input: WagerInput) => {
    await submitBet.mutateAsync(input);
    await Promise.all([
      betsQuery.refetch(),
      utils.user.points.invalidate(),
      utils.gambling.getUsersGamblingPointsForAssignments.invalidate({
        assignmentIds: [assignmentId],
      }),
    ]);
  };

  const hostOptions: WagerOption[] = [
    {
      lookupId: "mcp-rating-guess-1x",
      targetHostId: getSingleHostForLookupId("mcp-rating-guess-1x")?.id,
      label: `${getHostLabelForLookupId("mcp-rating-guess-1x")}’s rating`,
      description: "Win if this one host matches your saved pick.",
    },
    {
      lookupId: "fonso-rating-guess-1x",
      targetHostId: getSingleHostForLookupId("fonso-rating-guess-1x")?.id,
      label: `${getHostLabelForLookupId("fonso-rating-guess-1x")}’s rating`,
      description: "Win if this one host matches your saved pick.",
    },
    {
      lookupId: "harley-rating-guess-1x",
      targetHostId: getSingleHostForLookupId("harley-rating-guess-1x")?.id,
      label: `${getHostLabelForLookupId("harley-rating-guess-1x")}’s rating`,
      description: "Win if this one host matches your saved pick.",
    },
  ].filter((option) => option.targetHostId);

  const pairOptions: WagerOption[] = [
    {
      lookupId: "mcp-fonso-rating-guess-2x",
      label: getHostLabelForLookupId("mcp-fonso-rating-guess-2x"),
      description: "Win only if both hosts match your saved picks.",
    },
    {
      lookupId: "mcp-harley-rating-guess-2x",
      label: getHostLabelForLookupId("mcp-harley-rating-guess-2x"),
      description: "Win only if both hosts match your saved picks.",
    },
    {
      lookupId: "fonso-harley-rating-guess-2x",
      label: getHostLabelForLookupId("fonso-harley-rating-guess-2x"),
      description: "Win only if both hosts match your saved picks.",
    },
  ];

  const allOptions: WagerOption[] = [
    {
      lookupId: "all-rating-guess-3x",
      label: getHostLabelForLookupId("all-rating-guess-3x"),
      description: "Win only if every host matches your saved picks.",
    },
  ];

  const getPayoutMultiplier = (options: WagerOption[]) =>
    options
      .map((option) => getTypeFor(option.lookupId)?.multiplier)
      .find((multiplier) => multiplier !== undefined);

  const renderOptions = (options: WagerOption[], payoutTone: PayoutTone) =>
    options.map((option) => {
      const type = getTypeFor(option.lookupId);
      if (!type) return null;
      return (
        <BettingCoin
          key={`${option.lookupId}-${option.targetHostId ?? "all"}`}
          type={type}
          targetHostId={option.targetHostId}
          label={option.label}
          description={option.description}
          payoutTone={payoutTone}
          existingBet={getBetFor(option.lookupId, option.targetHostId)}
          assignmentId={assignmentId}
          userPoints={userPoints}
          isRoundOpen={isRoundOpen}
          onSubmit={handleSubmit}
        />
      );
    });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-4 sm:grid-cols-[1fr_auto] sm:items-start">
      
        <div>
          <p className="flex items-center gap-2 font-bold text-white">
            <AlertTriangle
              className="h-4 w-4 text-amber-300"
              aria-hidden="true"
            />
            † Wagers can lose points
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300">
            A loss deducts your wager. A win returns the wager plus the listed
            multiplier payout.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-black/25 px-3 py-2 text-sm">
          <Coins className="h-4 w-4 text-amber-300" aria-hidden="true" />
          <span className="text-zinc-400">Available</span>
          <strong className="text-white">{userPoints} points</strong>
        </div>
      </div>

      {!isRoundOpen && (
        <p className="rounded-lg border border-amber-400/20 bg-amber-400/[0.06] p-3 text-sm font-semibold text-amber-100">
          Betting is closed. Existing wagers are locked and shown below.
        </p>
      )}

      <div className="rounded-lg bg-white/[0.025] p-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          Your saved picks
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
          {hosts.map((host) => {
            const guess = guesses.find(
              (candidate) => candidate.hostId === host.id
            );
            return (
              <li
                key={host.id}
                className="flex items-center gap-2 text-sm text-zinc-300"
              >
                <span className="font-semibold text-white">
                  {host.name ?? "Host"}
                </span>
                {guess ? (
                  <RatingIcon value={guess.ratingId} />
                ) : (
                  <span>Not picked</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <WagerGroup
        title="One host"
        payoutMultiplier={getPayoutMultiplier(hostOptions)}
        payoutTone="standard"
        description="Lower risk: one result must match."
      >
        {renderOptions(hostOptions, "standard")}
      </WagerGroup>
      <WagerGroup
        title="Two hosts"
        payoutMultiplier={getPayoutMultiplier(pairOptions)}
        payoutTone="boosted"
        description="Both selected results must match."
      >
        {renderOptions(pairOptions, "boosted")}
      </WagerGroup>
      <WagerGroup
        title="All hosts"
        payoutMultiplier={getPayoutMultiplier(allOptions)}
        payoutTone="maximum"
        description="Highest risk: all three results must match."
      >
        {renderOptions(allOptions, "maximum")}
      </WagerGroup>
    </div>
  );
};

const WagerGroup = ({
  title,
  payoutMultiplier,
  payoutTone,
  description,
  children,
}: {
  title: string;
  payoutMultiplier: number | undefined;
  payoutTone: PayoutTone;
  description: string;
  children: React.ReactNode;
}) => {
  const sectionTone =
    payoutTone === "standard"
      ? "border-cyan-400/20 bg-cyan-400/[0.035]"
      : payoutTone === "boosted"
      ? "border-amber-400/20 bg-amber-400/[0.035]"
      : "border-rose-400/20 bg-rose-400/[0.035]";
  const payoutBadge =
    payoutTone === "standard"
      ? "border-cyan-300/30 bg-cyan-400/10 text-cyan-200"
      : payoutTone === "boosted"
      ? "border-amber-300/30 bg-amber-400/10 text-amber-200"
      : "border-rose-300/30 bg-rose-400/10 text-rose-200";

  return (
    <section className={cn("rounded-xl border p-3 sm:p-4", sectionTone)}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={cn(
            "rounded-lg border px-3 py-1.5 text-base font-black tabular-nums",
            payoutBadge
          )}
        >
          {payoutMultiplier !== undefined
            ? `${payoutMultiplier}x payout`
            : "Payout unavailable"}
        </span>
        <div>
          <h4 className="font-black text-white">{title}</h4>
          <p className="text-xs text-zinc-400">{description}</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
};

export default AssignmentGamblingBoard;
