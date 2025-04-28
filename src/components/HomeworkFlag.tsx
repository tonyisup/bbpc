import { type FC } from "react";
import { HiOutlineClipboardList, HiOutlinePaperClip, HiOutlineStar } from "react-icons/hi"
import { type AssignmentType } from "@/types/assignment";

interface HomeworkFlagProps {
  type: AssignmentType
}

const HomeworkFlag: FC<HomeworkFlagProps> = ({type}) => {
  return <>
    {type === "HOMEWORK" && <div className="sm:whitespace-nowrap">
      <HiOutlineClipboardList className="inline mx-1 text-4xl text-gray-300" title="Homework" />
      <span className="hidden sm:inline">Homework</span>
    </div>}
    {type === "EXTRA_CREDIT" && <div className="sm:whitespace-nowrap">
      <HiOutlinePaperClip className="inline mx-1 text-4xl text-gray-300" title="Extra Credit" />
      <span className="hidden sm:inline">Extra Credit</span>
    </div>}
    {type === "BONUS" && <div className="sm:whitespace-nowrap">
      <HiOutlineStar className="inline mx-1 text-4xl text-gray-300" title="Bonus" />
      <span className="hidden sm:inline">Bonus</span>
    </div>}
  </>
}

export default HomeworkFlag;