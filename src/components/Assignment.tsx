import { type Assignment, type Movie, type User } from "@prisma/client";
import { type FC } from "react";
import HomeworkFlag from "./HomeworkFlag";
import MovieInlinePreview from "./MovieInlinePreview";
import UserTag from "./UserTag";

interface AssignmentProps {
  assignment: Assignment & {
    User: User,
    Movie: Movie | null
  }
	showMovieTitles?: boolean,
}

const Assignment: FC<AssignmentProps> = ({ assignment, showMovieTitles = false }) => {
  return <div className="flex flex-col items-center gap-2 p-2">
    {assignment.Movie && <MovieInlinePreview movie={assignment.Movie} />}
    {showMovieTitles && <div className="text-sm text-gray-500">{assignment.Movie?.title} ({assignment.Movie?.year})</div>}
    <div className="flex items-center justify-between gap-4">
			<HomeworkFlag homework={assignment.homework ?? false} />
			<UserTag user={assignment.User} />
    </div>
  </div>
}

export default Assignment