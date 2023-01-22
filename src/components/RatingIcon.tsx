import { type Rating } from "@prisma/client";
import { type FC } from "react";
import { FaDollarSign, FaPoo, FaTrashAlt } from "react-icons/fa";
import { BiCameraMovie } from "react-icons/bi";

interface RatingProps {
  rating: Rating
}

const RatingIcon: FC<RatingProps> = ({rating}) => {
  const renderRating = () => {
    switch(rating.value) {
      case 1: return <FaPoo />
      case 2: return <FaTrashAlt />
      case 3: return <FaDollarSign />
      case 4: return <BiCameraMovie />
    }
  }
  return (
    <div className="flex items-center gap-2">
      {renderRating()}
    </div>
  )
}

export default RatingIcon