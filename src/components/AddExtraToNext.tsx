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

function AddExtraLink({ episode }: { episode: CompleteEpisode }) {
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
}

function SqlAddExtraToNext({
  episode,
  authenticated,
}: {
  episode: CompleteEpisode;
  authenticated: boolean;
}) {
  const { data: isSqlHost } = api.auth.isHost.useQuery(undefined, {
    enabled: authenticated,
    retry: false,
  });
  if (isSqlHost !== true) return null;
  return <AddExtraLink episode={episode} />;
}

export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {
  const { backend, status, user } = useBbpcAuth();
  if (!episode) return null;
  if (backend === "convex") {
    return user?.isHost === true ? (
      <AddExtraLink episode={episode} />
    ) : null;
  }
  return (
    <SqlAddExtraToNext
      episode={episode}
      authenticated={status === "authenticated"}
    />
  );
};
