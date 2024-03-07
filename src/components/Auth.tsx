import type { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC } from "react";
import { HiCog } from "react-icons/hi";
import { Avatar, AvatarImage, AvatarFallback } from "../../@/components/ui/avatar";

export const Auth: React.FC = () => {
  const { data: sessionData } = useSession();
  
  return <LoggedInAs session={sessionData} />
};
interface LoggedInAsProps {
	session: Session | null;
}
const LoggedInAs: FC<LoggedInAsProps> = ({ session }) => {
	if (!session) return null;
	if (!session.user) return null;
  const getInitials = function() {
    if (!session.user) return "";
    const name = session.user.name ?? session.user.email;
    if (!name) return "";
    if (name === undefined) return "";
    return name.split(" ").map((n) => n[0]).join("");
  }
	return <Link href="/profile">
    <Avatar>
      <AvatarImage src={session.user.image ?? ""} alt={(session.user.name || session.user.email) ?? ""} />
      <AvatarFallback><HiCog /></AvatarFallback>
    </Avatar>
  </Link>
}

export function AuthAvatar() {
  return 
}