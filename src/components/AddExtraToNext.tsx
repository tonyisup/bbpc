'use client';

import { type FC } from "react";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review, ExtraReview, Link as EpisodeLink, Show } from '@prisma/client';
import { api } from "@/trpc/react";
import Link from "next/link";
import { Button } from "./ui/button";
interface AddExtraToNextProps {
  episode: null | (EpisodeType & {
    assignments: (AssignmentType & {
      User: User;
      Movie: Movie | null;
    })[];
    extras: (ExtraReview & {
      Review: (Review & {
        User: User | null;
        Movie: Movie | null;
        Show: Show | null;
      })
    })[];
    links: EpisodeLink[];
  });
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
              href={`/episodes/${episode.id}/extras/add`}
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