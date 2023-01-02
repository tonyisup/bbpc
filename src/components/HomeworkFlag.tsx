import { FC } from "react";

import { HiBookOpen, HiClipboardCheck, HiClipboardCopy, HiClipboardList, HiOutlineClipboardList, HiOutlinePaperClip } from "react-icons/hi"

interface HomeworkFlagProps {
  homework: boolean
}

const HomeworkFlag: FC<HomeworkFlagProps> = ({homework}) => {
  return <>
    {homework && <div><HiOutlineClipboardList className="inline mx-1 text-4xl text-gray-300" title="Homework" /></div>}
    {!homework && <div><HiOutlinePaperClip className="inline mx-1 text-4xl text-gray-300" title="Extra Credit" /></div>}
  </>
}

export default HomeworkFlag;