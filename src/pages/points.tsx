import type { InferGetServerSidePropsType, NextPage } from "next";
import { ssr } from "../server/db/ssr";

export async function getServerSideProps() {
	const userPoints = await ssr.getPoints();
	return {
		props: {
			users: JSON.parse(JSON.stringify(userPoints))
		}
	}
}
const Points: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({users}) => {
  return <div className="bg-black flex flex-col w-full min-h-screen text-white items-center">
			<h2>Current Standings</h2>
			<table>
				<tr><th>Username</th><th>Points</th></tr>
				{users.map((user: {name: string, points: number}) => (
					<tr key={user.name}><td>{user.name}</td><td>{user.points}</td></tr>
				))}
			</table>
    </div>
};

export default Points;