import { type FC } from "react";
import HomeworkFlag from "./HomeworkFlag";
import MovieInlinePreview from "./MovieInlinePreview";
import UserTag from "./UserTag";
import { highlightText } from "@/utils/text";
import type { Assignment as AssignmentType, Movie, User } from "@prisma/client";

interface AssignmentProps {
  assignment: AssignmentType & {
    movie: Movie | null;
    user: User;
  }
  showMovieTitles?: boolean,
  searchQuery?: string,
}

const Assignment: FC<AssignmentProps> = ({ assignment, showMovieTitles = false, searchQuery = "" }) => {
  return <div className="flex flex-col items-center gap-2 p-2">
    {assignment.movie && <MovieInlinePreview movie={assignment.movie} />}
    {showMovieTitles && <div className="text-sm text-gray-500">{highlightText(assignment.movie?.title, searchQuery)} ({assignment.movie?.year})</div>}
    <div className="flex items-center justify-between gap-4">
      <HomeworkFlag type={assignment.type} />
      <UserTag user={assignment.user} />
    </div>
  </div>
}

export default Assignment;