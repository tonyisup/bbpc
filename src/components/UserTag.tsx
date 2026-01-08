import type { FC } from "react";

interface UserTagProps {
  username: string
}

const UserTag: FC<UserTagProps> = ({ username }) => {
  return <span className="text-gray-200 outline-2 outline-gray-500 outline px-2 py-1 rounded-lg leading-loose self-center underline underline-offset-4">
    {username}
  </span>
}

export default UserTag;