import type { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "../utils/trpc";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};

const Profile: NextPage = () => {
	const { data: session } = useSession();
  const [ userName, setUserName ] = useState<string>(session?.user?.name || "");
	const { mutate: updateUser } = trpc.user.update.useMutation();
	const [ saved, setSaved ] = useState<boolean>(false);

	const handleSave = async function() {
		updateUser({ name: userName });
		setSaved(true);
	}

	if (!session) return (
		<div>
			<h1 className="text-2xl">Profile</h1>
			<p>Please sign in to view your profile</p>
		</div>
	)

	return <div className="flex flex-col gap-2 mb-8">
		<button
			type="button"
			title="Sign Out"
			className="rounded-full bg-white/10 p-2 font-semibold text-red-600 no-underline transition hover:bg-white/20"
			onClick={() => signOut()}
		>
			Sign Out
		</button>
			<h1 className="text-2xl">Profile</h1>
      <div>
        <label htmlFor="name">Name</label>
        <input
          title="name"
          type="text"
          name="name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="text-xl text-gray-900 w-full rounded-md border-gray-300 shadow-sm focus:border-violet-300 focus:ring focus:ring-inset"
        />
      </div>
			<div>
				<button className="rounded-md bg-red-800 p-4 transition hover:bg-violet-600"
					onClick={handleSave}
				>
					Save
				</button>
				{saved && <p className="p-4 text-green-500">Saved! - Refresh to see changes</p>}
			</div>
		</div>
}

export default Profile;