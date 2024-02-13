import type { Session } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { FC } from "react";
import { HiCog } from "react-icons/hi";

export const Auth: React.FC = () => {
  const { data: sessionData } = useSession();
  
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <LoggedInAs session={sessionData} />
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
interface LoggedInAsProps {
	session: Session | null;
}
const LoggedInAs: FC<LoggedInAsProps> = ({ session }) => {
	if (!session) return null;
	if (!session.user) return null;
	return (
		<div className="flex items-center gap-2 text-center text-2xl text-white">
			<p>Logged in as</p>
			<p className="font-semibold">{session.user.name || session.user.email}</p>
			<Link href="/profile">
				<HiCog title="Edit profile" className="text-base text-white cursor-pointer" />
			</Link>
		</div>
	)
}