import { User } from "@prisma/client";
import { FC } from "react";

interface UserTagProps {
  user: User
}

const UserTag: FC<UserTagProps> = ({user}) => {
  return <span className="text-gray-200 bg-gray-700 px-2 py-1 rounded-md leading-loose">
    {user.name}
  </span>
}

export default UserTag;