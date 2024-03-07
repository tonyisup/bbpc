import { type FC } from "react";

import { HiOutlineClipboardList, HiOutlinePaperClip } from "react-icons/hi"

interface HomeworkFlagProps {
  homework: boolean
}

const HomeworkFlag: FC<HomeworkFlagProps> = ({homework}) => {
  return <>
    {homework && <div className="sm:whitespace-nowrap">
      <HiOutlineClipboardList className="inline mx-1 text-4xl text-gray-300" title="Homework" />
      <span className="hidden sm:inline">Homework</span>
    </div>}
    {!homework && <div className="sm:whitespace-nowrap">
      <HiOutlinePaperClip className="inline mx-1 text-4xl text-gray-300" title="Extra Credit" />
      <span className="hidden sm:inline">Extra Credit</span>
    </div>}
  </>
}

export default HomeworkFlag;