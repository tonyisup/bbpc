import type { User } from "@prisma/client";
import type { FC } from "react";

interface UserTagProps {
  user: User | null
}

const UserTag: FC<UserTagProps> = ({user}) => {
	if (!user) return null;
  return <span className="text-gray-200 bg-gray-700 px-2 py-1 rounded-md leading-loose self-center">
    {user.name}
  </span>
}

export default UserTag;