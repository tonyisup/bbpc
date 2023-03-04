import { Assignment, type Movie, type User } from "@prisma/client";
import { useState, type FC } from "react";
import ReactCardFlip from "react-card-flip";
import { trpc } from "../utils/trpc";
import HomeworkFlag from "./HomeworkFlag";
import MovieInlinePreview from "./MovieInlinePreview";
import RatingIcon from "./RatingIcon";
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
  {assignment.Movie &&   
	
	<MovieInlinePreview movie={assignment.Movie} />
    // <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
		// 	<div>
    // 		<MovieInlinePreview movie={assignment.Movie} />
		// 		<div 
		// 			onClick={() => setFlipped(true)}
		// 			className="cursor-pointer w-5 h-5 absolute left-0 top-0 z-1000 overflow-hidden bg-black box-shadow-2xl transition-all duration-300 ease-in-out"
		// 		>
		// 			<div
		// 				className="absolute w-10 h-6 bg-gradient-to-b from-black to-white transform -rotate-45"
		// 			>
		// 			</div>
		// 		</div>
		// 	</div>
    //   <div>
		// 		<div className="w-[144px] h-[216px] flex flex-col justify-center items-center">
		// 			{assignmentData && assignmentData.Review.map(review => {
		// 				if (!review.Rating) return;
		// 				return <RatingIcon key={review.Rating.id} rating={review.Rating} />
		// 			})}
		// 		</div>
		// 		<div 
		// 			onClick={() => setFlipped(false)}
		// 			className="cursor-pointer w-5 h-5 absolute left-0 top-0 z-1000 overflow-hidden bg-black box-shadow-2xl transition-all duration-300 ease-in-out"
		// 		>
		// 			<div
		// 				className="absolute w-10 h-6 bg-gradient-to-b from-black to-white transform -rotate-45"
		// 			>
		// 			</div>
		// 		</div>
    //   </div>
    // </ReactCardFlip>
  }
</div>
}

export default Assignment