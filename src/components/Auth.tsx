import type { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../../@/components/ui/avatar";

export const Auth: React.FC = () => {
  const { data: sessionData } = useSession();
  
  return <LoggedInAs session={sessionData} />
};
interface LoggedInAsProps {
	session: Session | null;
}
const LoggedInAs: FC<LoggedInAsProps> = ({ session }) => {
	if (!session || !session.user) return <button
    type="button"
    title="Sign in"
    className="font-semibold text-red-600 no-underline transition hover:text-red-400"
    onClick={() => signIn()}
  >
    Sign in
  </button>;

 /*  const getInitials = function() {
    if (!session.user) return "";
    const name = session.user.name ?? session.user.email;
    if (!name) return "";
    if (name === undefined) return "";
    return name.split(" ").map((n) => n[0]).join("");
  } */
	return <Link className="transition hover:text-red-400 cursor-pointer" href="/profile">
    <Avatar>
      <AvatarImage src={session.user.image ?? ""} alt={(session.user.name || session.user.email) ?? ""} />
      <AvatarFallback>Profile</AvatarFallback>
    </Avatar>
  </Link>
}

export function AuthAvatar() {
  return 
}