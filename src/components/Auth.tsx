import type { Session } from "next-auth";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../../@/components/ui/avatar";

export const SignInButton: FC<{ className?: string }> = ({ className }) => (
  <button
    type="button"
    title="Sign in"
    className={`font-semibold text-red-600 no-underline transition hover:text-red-400 ${className ?? ''}`}
    onClick={() => signIn()}
  >
    Sign in
  </button>
);

export const Auth: React.FC = () => {
  const { data: sessionData, status } = useSession();
  
  if (status === "loading") {
    return <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200" />;
  }
  
  return <LoggedInAs session={sessionData} />;
};

interface LoggedInAsProps {
	session: Session | null;
}

const LoggedInAs: FC<LoggedInAsProps> = ({ session }) => {
	if (!session || !session.user) return <SignInButton />;

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