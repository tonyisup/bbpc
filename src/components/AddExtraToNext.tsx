'use client';

import { type FC } from "react";
import type { CompleteEpisode } from './Episode';
import { api } from "@/trpc/react";
import Link from "next/link";
import { Button } from "./ui/button";
import { getEpisodeExtrasAddPath } from "@/lib/routes";
interface AddExtraToNextProps {
  episode: CompleteEpisode | null;
}

export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {
  const { data: isHost } = api.auth.isHost.useQuery();
  if (!episode) return null;
  return (
    <>
      {isHost && episode && (
        <div className="flex justify-center items-center gap-2 w-full p-2">
          <Button variant="outline" asChild>
            <Link
              href={getEpisodeExtrasAddPath(episode.slug ?? episode.id)}
              replace={false}
            >
              Add Extra
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}
