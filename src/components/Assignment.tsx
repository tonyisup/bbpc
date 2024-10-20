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
}

const Assignment: FC<AssignmentProps> = ({ assignment }) => {
  return <div className="flex flex-col items-center gap-2 p-2">
    <MovieInlinePreview movie={assignment.Movie} />
    <div className="flex items-center justify-between gap-4">
			<HomeworkFlag homework={assignment.homework ?? false} />
			<UserTag user={assignment.User} />
    </div>
  </div>
}

export default Assignment