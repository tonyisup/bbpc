import type { FC } from "react";
import AddEpisodeExtraModal from "./AddEpisodeExtraModal";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review } from '@prisma/client';
import { trpc } from "../utils/trpc";

interface AddExtraToNextProps {
  episode:  (EpisodeType & {
    Assignment: (AssignmentType & {
        User: User;
        Movie: Movie | null;
    })[];
    Review: (Review & {
        User: User;
        Movie: Movie;
    })[];
	});
}
export const AddExtraToNext: FC<AddExtraToNextProps> = ({ episode }) => {  
	const { data: isAdmin } = trpc.auth.isAdmin.useQuery();
  
  return (
    <>
      {isAdmin && episode && <div className="flex justify-center items-center gap-2 w-full p-2">
        <AddEpisodeExtraModal episode={episode} />
      </div>}
    </>
  )
}