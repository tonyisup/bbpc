import type { User } from "@prisma/client";
import type { FC } from "react";

interface UserTagProps {
  user: User | null
}

const UserTag: FC<UserTagProps> = ({ user }) => {
  if (!user) return null;
  return <span className="text-gray-200 outline-2 outline-gray-500 outline px-2 py-1 rounded-lg leading-loose self-center underline underline-offset-4">
    {user.name}
  </span>
}

export default UserTag;