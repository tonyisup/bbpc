"use client";

import { getEpisodeExtrasAddPath } from "@/lib/routes";
import { api } from "@/trpc/react";
import Link from "next/link";
import { type FC } from "react";

import { useBbpcAuth } from "./auth/BbpcAuthContext";
import type { CompleteEpisode } from "./Episode";
import { Button } from "./ui/button";

interface AddExtraToNextProps {
  episode: CompleteEpisode | null;
}

export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {
  const { backend, status, user } = useBbpcAuth();
  const { data: isSqlHost } = api.auth.isHost.useQuery(undefined, {
    enabled: backend === "sql" && status === "authenticated",
    retry: false,
  });
  const canAddExtra =
    backend === "convex" ? user?.isHost === true : isSqlHost === true;

  if (!episode) return null;
  if (!canAddExtra) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2 p-2">
      <Button variant="outline" asChild>
        <Link
          href={getEpisodeExtrasAddPath(episode.slug ?? episode.id)}
          replace={false}
        >
          Add Extra
        </Link>
      </Button>
    </div>
  );
};
