import { Assignment, type Movie, type User } from "@prisma/client";
import { useState, type FC } from "react";
import ReactCardFlip from "react-card-flip";
import HomeworkFlag from "./HomeworkFlag";
import MovieInlinePreview from "./MovieInlinePreview";
import UserTag from "./UserTag";

interface AssignmentProps {
  assignment: Assignment & {
    User: User,
    Movie: Movie | null
  },
  showRatings: boolean
}

const Assignment: FC<AssignmentProps> = ({ assignment }) => {
  const [flipped, setFlipped] = useState(false);
  return <div key={assignment.id} className="flex flex-col items-center gap-2">
  <div className="flex gap-4">
    <HomeworkFlag homework={assignment.homework ?? false} />
    <UserTag user={assignment.User} />
  </div>
  {assignment.Movie && 
    <ReactCardFlip isFlipped={flipped} flipDirection="vertical">
      <MovieInlinePreview movie={assignment.Movie} />
      <div>
        {/* page peel effect in tailwindcss */}
      </div>
    </ReactCardFlip>
  }
</div>
}

export default Assignment