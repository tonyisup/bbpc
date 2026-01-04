'use client'

import { type FC } from "react";
import { api } from "@/trpc/react";
import { User } from "@prisma/client";
import UserTag from "./UserTag";
import BettingCoin from "./BettingCoin";

interface AssignmentGamblingBoardProps {
	assignmentId: string;
	userId: string;
	hosts: User[];
}

const AssignmentGamblingBoard: FC<AssignmentGamblingBoardProps> = ({ assignmentId, userId, hosts }) => {
	const { data: gamblingTypes } = api.gambling.getAllActive.useQuery();
	const { data: userPoints } = api.user.points.useQuery();
	const { data: myBets, refetch: refetchBets } = api.gambling.getForAssignment.useQuery({ assignmentId });

	const utils = api.useUtils();

	const submitBet = api.gambling.submitPoints.useMutation({
		onSuccess: () => {
			refetchBets();
			utils.user.points.invalidate();
		}
	});

	const getBetFor = (lookupId: string, targetHostId?: string) => {
		const type = gamblingTypes?.find(t => t.lookupId === lookupId);
		if (!type) return undefined;
		return myBets?.find(b =>
			b.gamblingTypeId === type.id &&
			(!targetHostId || (b as any).targetUserId === targetHostId)
		);
	};

	return (
		<div className="flex flex-col items-center gap-2 p-6 bg-gray-900/30 rounded-2xl border border-gray-800 shadow-inner max-w-2xl mx-auto w-full">
			<div className="relative grid grid-cols-7 w-full items-center">
				<span className="absolute top-0 right-0 text-[10px] text-gray-500 font-bold mb-1 opacity-70">Wanna bet?</span>

				{/* Row 1: Top Arch Bet (2x) - MCP & Harley */}
				<div className="col-start-1 col-span-5 row-start-1 relative flex justify-center h-20">
					<div className="absolute top-10 w-[85%] h-14 border-t-2 border-x-2 border-gray-700 rounded-t-[120px] pointer-events-none opacity-50" />
					<div className="z-10 px-4 py-1 rounded-full self-start">
						<BettingCoin
							lookupId="rating-guess-2x"
							label="MCP & Harley"
							gamblingTypes={gamblingTypes}
							getBetFor={getBetFor}
							submitBet={submitBet}
							userId={userId}
							assignmentId={assignmentId}
							userPoints={userPoints}
						/>
					</div>
				</div>

				{/* Row 2: Host Name Cards + Trio Agree */}
				<div className="col-start-1 row-start-2 flex justify-center">
					<div className="w-full flex justify-center py-2 px-1 rounded-xl bg-gray-800/50 shadow-md">
						<UserTag user={hosts[0]!} />
					</div>
				</div>
				<div className="col-start-3 row-start-2 flex justify-center">
					<div className="w-full flex justify-center py-2 px-1 rounded-xl bg-gray-800/50 shadow-md">
						<UserTag user={hosts[1]!} />
					</div>
				</div>
				<div className="col-start-5 row-start-2 flex justify-center">
					<div className="w-full flex justify-center py-2 px-1 rounded-xl bg-gray-800/50 shadow-md">
						<UserTag user={hosts[2]!} />
					</div>
				</div>
				<div className="col-start-7 row-start-2 flex flex-col items-center pl-4 py-2">
					<BettingCoin
						lookupId="rating-guess-3x"
						label="All Three"
						gamblingTypes={gamblingTypes}
						getBetFor={getBetFor}
						submitBet={submitBet}
						userId={userId}
						assignmentId={assignmentId}
						userPoints={userPoints}
					/>
				</div>

				{/* Row 3: 1x Bets */}
				<div className="col-start-1 row-start-3 flex flex-col items-center">
					<span className="text-[10px] text-gray-500 font-bold mb-1 opacity-70">1x</span>
					<BettingCoin
						lookupId="rating-guess-1x"
						targetHostId={hosts[0]?.id}
						label={hosts[0]?.name?.split(' ')[0] ?? ""}
						gamblingTypes={gamblingTypes}
						getBetFor={getBetFor}
						submitBet={submitBet}
						userId={userId}
						assignmentId={assignmentId}
						userPoints={userPoints}
					/>
				</div>
				<div className="col-start-3 row-start-3 flex flex-col items-center">
					<span className="text-[10px] text-gray-500 font-bold mb-1 opacity-70">1x</span>
					<BettingCoin
						lookupId="rating-guess-1x"
						targetHostId={hosts[1]?.id}
						label={hosts[1]?.name?.split(' ')[0] ?? ""}
						gamblingTypes={gamblingTypes}
						getBetFor={getBetFor}
						submitBet={submitBet}
						userId={userId}
						assignmentId={assignmentId}
						userPoints={userPoints}
					/>
				</div>
				<div className="col-start-5 row-start-3 flex flex-col items-center">
					<span className="text-[10px] text-gray-500 font-bold mb-1 opacity-70">1x</span>
					<BettingCoin
						lookupId="rating-guess-1x"
						targetHostId={hosts[2]?.id}
						label={hosts[2]?.name?.split(' ')[0] ?? ""}
						gamblingTypes={gamblingTypes}
						getBetFor={getBetFor}
						submitBet={submitBet}
						userId={userId}
						assignmentId={assignmentId}
						userPoints={userPoints}
					/>
				</div>

				{/* Row 4: Pair Agree Bets (positioned between hosts) */}
				<div className="col-start-2 row-start-4 flex flex-col items-center">
					<div className="w-12 h-4 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-50 mb-1" />
					<div className="whitespace-nowrap flex justify-center">
						<BettingCoin
							lookupId="rating-guess-2x"
							label="MCP & Fonso"
							gamblingTypes={gamblingTypes}
							getBetFor={getBetFor}
							submitBet={submitBet}
							userId={userId}
							assignmentId={assignmentId}
							userPoints={userPoints}
						/>
					</div>
				</div>
				<div className="col-start-4 row-start-4 flex flex-col items-center">
					<div className="w-12 h-4 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-50 mb-1" />
					<div className="whitespace-nowrap flex justify-center">
						<BettingCoin
							lookupId="rating-guess-2x"
							label="Fonso & Harley"
							gamblingTypes={gamblingTypes}
							getBetFor={getBetFor}
							submitBet={submitBet}
							userId={userId}
							assignmentId={assignmentId}
							userPoints={userPoints}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignmentGamblingBoard;
