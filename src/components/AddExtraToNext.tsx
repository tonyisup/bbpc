'use client';

import { type FC } from "react";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review, ExtraReview, Link as EpisodeLink } from '@prisma/client';
import { api } from "@/trpc/react";
import Link from "next/link";

interface AddExtraToNextProps {
  episode: null | (EpisodeType & {
    assignments: (AssignmentType & {
        User: User;
        Movie: Movie | null;
    })[];
    extras: (ExtraReview & {
      Review: (Review & {
        User: User;
        Movie: Movie;
    })})[];
		links: EpisodeLink[];
	});
}

export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {  
	const { data: isAdmin } = api.auth.isAdmin.useQuery();
	
	if (!episode) return null;
  return (
    <>
      {isAdmin && episode && (
        <div className="flex justify-center items-center gap-2 w-full p-2">
          <Link 
            href={`/episodes/${episode.id}/extras/add`}
            className="rounded-md bg-red-800 p-4 text-xs transition hover:bg-red-400"
          >
            Add Extra
          </Link>
        </div>
      )}
    </>
  )
}