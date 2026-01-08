'use client'

import { type FC, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/trpc/react";
import { Rating, User } from "@prisma/client";
import BettingCoin from "./BettingCoin";
import RatingIcon from "./RatingIcon";

interface AssignmentGamblingBoardProps {
	assignmentId: string;
	userId: string;
	hosts: User[];
	guesses: {
		hostId: string;
		ratingId: number;
	}[];
}


const gamblingTitle = [
	"Wanna bet?",
	"Go ahead and gamble!",
	"You've got nothing to lose!",
	"How confident are you?",
]
const AssignmentGamblingBoard: FC<AssignmentGamblingBoardProps> = ({ assignmentId, userId, hosts, guesses }) => {
	const { data: gamblingTypes } = api.gambling.getAllActive.useQuery();
	const { data: userPoints } = api.user.points.useQuery();
	const { data: myBets, refetch: refetchBets } = api.gambling.getForAssignment.useQuery({ assignmentId });

	const [titleIndex, setTitleIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setTitleIndex((prev) => (prev + 1) % gamblingTitle.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

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
				<motion.div
					initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
					animate={{ opacity: 1, scale: 1, rotate: 2 }}
					whileHover={{ scale: 1.1, rotate: 0 }}
					className="absolute -top-3 -right-3 flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-lg shadow-amber-500/20 cursor-default select-none z-20 group overflow-hidden"
				>
					{/* Shine effect */}
					<motion.div
						animate={{ x: ["-100%", "200%"] }}
						transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 1 }}
						className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-[20deg]"
					/>

					<AnimatePresence mode="wait">
						<motion.span
							key={titleIndex}
							initial={{ y: 10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: -10, opacity: 0 }}
							className="relative text-[10px] font-black text-amber-950 uppercase tracking-widest drop-shadow-sm inline-block min-w-[120px] text-right"
						>
							{gamblingTitle[titleIndex]}
						</motion.span>
					</AnimatePresence>
					<motion.span
						animate={{ rotate: [0, 15, -15, 0] }}
						transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
						className="relative text-xs"
					>
						🎲
					</motion.span>
				</motion.div>

				{/* Row 1: Top Arch Bet (2x) - MCP & Harley */}
				<div className="col-start-1 col-span-5 row-start-1 relative flex justify-center h-20">
					<div className="absolute top-10 w-[85%] h-14 border-t-2 border-x-2 border-gray-700 rounded-t-[120px] pointer-events-none opacity-50" />
					<div className="z-10 px-4 py-1 rounded-full self-start">
						<BettingCoin
							lookupId="mcp-harley-rating-guess-2x"
							label="MCP & Harley"
							gamblingTypes={gamblingTypes}
							getBetFor={getBetFor}
							submitBet={submitBet}
							userId={userId}
							assignmentId={assignmentId}
							userPoints={userPoints}
						/>
						<div className="w-full text-center text-[10px] text-gray-500 font-bold mb-1 opacity-70">2x</div>
					</div>
				</div>

				{/* Row 2: Host Name Cards + Trio Agree */}
				<div className="col-start-1 row-start-2 flex justify-center">
					<div className="w-full flex justify-center items-center p-2 gap-2 rounded-xl bg-gray-800/50 shadow-md outline">
						{hosts[0]?.name && <span className="text-gray-200 rounded-lg leading-loose self-center underline underline-offset-4">{hosts[0].name}</span>}
						{guesses.find(g => g.hostId == hosts[0]?.id) && <RatingIcon value={guesses.find(g => g.hostId == hosts[0]?.id)?.ratingId} />}
					</div>
				</div>
				<div className="col-start-3 row-start-2 flex justify-center">
					<div className="w-full flex justify-center items-center p-2 gap-2 rounded-xl bg-gray-800/50 shadow-md outline">
						{hosts[1]?.name && <span className="text-gray-200 rounded-lg leading-loose self-center underline underline-offset-4">{hosts[1].name}</span>}
						{guesses.find(g => g.hostId === hosts[1]?.id) && <RatingIcon value={guesses.find(g => g.hostId === hosts[1]?.id)?.ratingId} />}
					</div>
				</div>
				<div className="col-start-5 row-start-2 flex justify-center">
					<div className="w-full flex justify-center items-center p-2 gap-2 rounded-xl bg-gray-800/50 shadow-md outline">
						{hosts[2]?.name && <span className="text-gray-200 rounded-lg leading-loose self-center underline underline-offset-4">{hosts[2].name}</span>}
						{guesses.find(g => g.hostId === hosts[2]?.id) && <RatingIcon value={guesses.find(g => g.hostId === hosts[2]?.id)?.ratingId} />}
					</div>
				</div>

				<div className="col-start-6 row-start-2 flex justify-center">
					<div className="w-full text-right text-[10px] text-gray-500 font-bold mb-1 opacity-70">3x</div>
				</div>

				<div className="col-start-7 row-start-2 flex flex-col items-center pl-4 py-2">
					<BettingCoin
						lookupId="all-rating-guess-3x"
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
						lookupId="mcp-rating-guess-1x"
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
						lookupId="fonso-rating-guess-1x"
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
						lookupId="harley-rating-guess-1x"
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
					<div className="w-full text-center text-[10px] text-gray-500 font-bold mb-1 opacity-70">2x</div>

					<div className="w-12 h-4 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-50 mb-1" />
					<div className="whitespace-nowrap flex justify-center">

						<BettingCoin
							lookupId="mcp-fonso-rating-guess-2x"
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
					<div className="w-full text-center text-[10px] text-gray-500 font-bold mb-1 opacity-70">2x</div>

					<div className="w-12 h-4 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-50 mb-1" />
					<div className="whitespace-nowrap flex justify-center">
						<BettingCoin
							lookupId="fonso-harley-rating-guess-2x"
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
