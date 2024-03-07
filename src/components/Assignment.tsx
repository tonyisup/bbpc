import { Assignment, type Movie, type User } from "@prisma/client";
import Link from "next/link";
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
    <div className="flex flex-col items-center justify-between gap-2">
      <div className="flex gap-4">
        <HomeworkFlag homework={assignment.homework ?? false} />
        <UserTag user={assignment.User} />
      </div>
    </div>    
  </div>
}

export default Assignment