import { type FC } from "react";
import HomeworkFlag from "./HomeworkFlag";
import MovieInlinePreview from "./MovieInlinePreview";
import UserTag from "./UserTag";
import { highlightText } from "@/utils/text";
import type { Assignment as AssignmentType, Movie, User } from "@prisma/client";

interface AssignmentProps {
  assignment: AssignmentType & {
    Movie: Movie | null;
    User: User;
  }
  showMovieTitles?: boolean,
  searchQuery?: string,
}

const Assignment: FC<AssignmentProps> = ({ assignment, showMovieTitles = false, searchQuery = "" }) => {
  return <div className="flex flex-col items-center gap-2 p-2">
    {assignment.Movie && <MovieInlinePreview movie={assignment.Movie} />}
    {showMovieTitles && <div className="text-sm text-gray-500">{highlightText(assignment.Movie?.title, searchQuery)} ({assignment.Movie?.year})</div>}
    <div className="flex items-center justify-between gap-4">
      <HomeworkFlag type={assignment.type} />
      <UserTag user={assignment.User} />
    </div>
  </div>
}

export default Assignment;