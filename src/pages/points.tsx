import type { User } from "@prisma/client";
import type { InferGetServerSidePropsType, NextPage } from "next";
import { type FC, useState } from "react";
import { HiArrowCircleLeft, HiArrowSmLeft, HiCheck, HiMinusCircle, HiOutlineArrowCircleLeft, HiOutlineMinusCircle, HiOutlinePlusCircle, HiPlusCircle, HiUpload } from "react-icons/hi";
import { ssr } from "../server/db/ssr";
import { trpc } from "../utils/trpc";

export async function getServerSideProps() {
	const userPoints = await ssr.getPoints();
	return {
		props: {
			users: JSON.parse(JSON.stringify(userPoints))
		}
	}
}
const Points: NextPage = () => {
	
	const { data: isAdmin } = trpc.auth.isAdmin.useQuery();
	const { data: users, refetch: refreshUsers } = trpc.game.points.useQuery();

	const handleRefresh = () => {
		refreshUsers();
	}
  return <div className="bg-black flex flex-col w-full min-h-screen text-white items-center">
			<h2>Current Standings</h2>
			<table>
				<tr>
					<th>Username</th>
					<th>Current</th>
					{isAdmin && <th>Edit (1) (0.5)</th>}
				</tr>
				{users && users.map((user: User) => (
					<tr key={user.name}>
						<td className="p-2">{user.name}</td>
						<td className="p-2">{user.points?.toString()}</td>
						{isAdmin && <td>
							<UserPointsEdit user={user} pointsUpdated={handleRefresh} />
						</td>}
					</tr>
				))}
			</table>
    </div>
};
interface UserPointsEditProps {
	user: User,
	pointsUpdated: () => void
}
const UserPointsEdit: FC<UserPointsEditProps> = ({user, pointsUpdated}) => {
	const [pointsToAdd, setPointsToAdd] = useState<number>(0);
	const { mutateAsync: addPoints } = trpc.game.addPointsToUser.useMutation({
		onSuccess: () => {
			pointsUpdated();
		}
	});

	const handleSave = () => {
		addPoints({userId: user.id, points: pointsToAdd});
		setPointsToAdd(0);
	}
	const handleAddOne = () => {
		setPointsToAdd(pointsToAdd + 1);
	}
	const handleSubtractOne = () => {
		setPointsToAdd(pointsToAdd - 1);
	}
	const handleAddHalf = () => {
		setPointsToAdd(pointsToAdd + 0.5);
	}
	const handleSubtractHalf = () => {
		setPointsToAdd(pointsToAdd - 0.5);
	}
	return <div className="p-2 grid grid-cols-4 gap-2 space-between items-center">
		{(pointsToAdd != 0) && <HiOutlineArrowCircleLeft onClick={handleSave} title="Add and save" className="cursor-pointer text-2xl" />}
		{(pointsToAdd == 0) && <HiOutlineArrowCircleLeft className="text-2xl text-gray-500 cursor-not-allowed" />}
		<span className="text-lg font-bold">{pointsToAdd}</span>
		<div className="flex flex-col items-center gap-1">
			<button type="button" title="+1" onMouseDown={handleAddOne}><HiPlusCircle className="text-xl"/></button>
			<button type="button" title="-1" onMouseDown={handleSubtractOne}><HiMinusCircle className="text-xl" /></button>
		</div>
		<div className="flex flex-col items-center gap-1">
			<button type="button" title="+0.5" onMouseDown={handleAddHalf}><HiOutlinePlusCircle /></button>
			<button type="button" title="-0.5" onMouseDown={handleSubtractHalf}><HiOutlineMinusCircle /></button>
		</div>
	</div>
}
export default Points;