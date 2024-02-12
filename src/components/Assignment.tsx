import { Assignment, type Movie, type User } from "@prisma/client";
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
  return <div key={assignment.id} className="flex flex-col items-center gap-2">
  <div className="flex gap-4">
    <HomeworkFlag homework={assignment.homework ?? false} />
    <UserTag user={assignment.User} />
  </div>
  <MovieInlinePreview movie={assignment.Movie} />
</div>
}

export default Assignment