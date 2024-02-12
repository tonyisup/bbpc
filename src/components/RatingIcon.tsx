import { type Rating } from "@prisma/client";
import { type FC } from "react";
import { FaDollarSign, FaPoo, FaTrashAlt } from "react-icons/fa";
import { BiCameraMovie } from "react-icons/bi";
import { trpc } from "../utils/trpc";

interface RatingProps {
	value: number | undefined,
}

const RatingIcon: FC<RatingProps> = ({value}) => {
  const renderRating = () => {
		if (!value) return null;
    switch(value) {
      case 1: return <span title="Goldbloom"><FaPoo /></span>
      case 2: return <span title="Waste"><FaTrashAlt /></span>
      case 3: return <span title="Dollar"><FaDollarSign /></span>
      case 4: return <span title="Slater"><BiCameraMovie /></span>
			default: return null;
    }
  }
  return (
		<>
    	{renderRating()}
		</>
  )
}

export default RatingIcon