'use client'

import { type FC, useState } from "react";
import { api } from "@/trpc/react";
import { User } from "@prisma/client";
import { Coins, Loader2 } from "lucide-react";
import UserTag from "./UserTag";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

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
		return myBets?.find(b =>
			b.GamblingType?.lookupId === lookupId &&
			(!targetHostId || b.targetUserId === targetHostId)
		);
	};

	const BettingCoinProps = ({ lookupId, targetHostId, label }: { lookupId: string, targetHostId?: string, label: string }) => {
		const [amount, setAmount] = useState<string>("");
		const type = gamblingTypes?.find(t => t.lookupId === lookupId);
		const existingBet = getBetFor(lookupId, targetHostId);

		const handleBet = () => {
			if (!type) return;
			const pts = parseInt(amount);
			if (isNaN(pts)) return;
			submitBet.mutate({
				userId,
				gamblingTypeId: type.id,
				points: pts,
				assignmentId,
				targetUserId: targetHostId
			});
		};

		if (!type) return null;

		const coinCount = lookupId.endsWith('-1x') ? 1 : lookupId.endsWith('-2x') ? 2 : 3;

		return (
			<Popover>
				<PopoverTrigger asChild>
					<div className="flex flex-col items-center gap-1 cursor-pointer group">
						<div className="flex -space-x-1 group-hover:scale-110 transition-transform">
							{[...Array(coinCount)].map((_, i) => (
								<div key={i} className={cn(
									"w-6 h-6 rounded-full bg-amber-500 border-2 border-amber-300 flex items-center justify-center shadow-lg",
									existingBet && existingBet.points > 0 ? "bg-emerald-500 border-emerald-300" : ""
								)}>
									<span className="text-[10px] font-bold text-amber-900 leading-none">1</span>
								</div>
							))}
						</div>
						<span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{label}</span>
						{existingBet && existingBet.points > 0 && (
							<span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-1 rounded border border-emerald-500/30">
								{existingBet.points}
							</span>
						)}
					</div>
				</PopoverTrigger>
				<PopoverContent className="w-48 bg-gray-900 border-gray-700 p-3">
					<div className="flex flex-col gap-2">
						<p className="text-xs text-gray-400 font-medium">Bet on {label} ({type.multiplier}x)</p>
						<div className="flex gap-2">
							<Input
								type="number"
								placeholder="Pts"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								className="h-8 bg-gray-800 border-gray-700 text-white"
							/>
							<Button size="sm" onClick={handleBet} disabled={submitBet.isLoading} className="h-8">
								{submitBet.isLoading ? <Loader2 className="animate-spin w-3 h-3" /> : "Bet"}
							</Button>
						</div>
						{existingBet && (
							<Button variant="ghost" size="sm" onClick={() => {
								setAmount("0");
								submitBet.mutate({ userId, gamblingTypeId: type.id, points: 0, assignmentId, targetUserId: targetHostId });
							}} className="h-6 text-[10px] text-red-400 hover:text-red-300">
								Clear Bet
							</Button>
						)}
						<p className="text-[10px] text-gray-500 italic">Balance: {Number(userPoints)} pts</p>
					</div>
				</PopoverContent>
			</Popover>
		);
	};

	return (
		<div className="flex flex-col items-center gap-6 p-6 bg-gray-900/30 rounded-2xl border border-gray-800 shadow-inner max-w-xl mx-auto w-full">
			{/* Top Arch Bet (2x) */}
			<div className="relative w-full flex justify-center">
				<div className="absolute top-4 w-2/3 h-12 border-t-2 border-x-2 border-gray-700 rounded-t-[100px] pointer-events-none opacity-50" />
				<div className="pt-0 z-10 bg-gray-900/30 px-4 rounded-full">
					<BettingCoinProps lookupId="rating-guess-2x" label="Duo Agree" />
				</div>
			</div>

			<div className="flex justify-between w-full gap-4 items-center">
				{hosts.map((host, idx) => (
					<div key={host.id} className="flex flex-col items-center gap-4 flex-1">
						<div className="w-full flex justify-center py-2 px-1 border-2 border-gray-700 rounded-xl bg-gray-800/50 shadow-md">
							<UserTag user={host} />
						</div>

						<div className="flex flex-col items-center gap-6">
							<div className="flex flex-col items-center">
								<span className="text-xs text-gray-500 font-bold mb-1">1x</span>
								<BettingCoinProps lookupId="rating-guess-1x" targetHostId={host.id} label={host.name?.split(' ')[0] ?? ""} />
							</div>

							{/* Brackets logic (Pair Agree) - Only between hosts */}
							{idx < hosts.length - 1 && (
								<div className="absolute translate-x-[50%] mt-20 z-0">
									<div className="w-12 h-6 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-40" />
								</div>
							)}
						</div>
					</div>
				))}

				{/* 3x Side Bet (Group) */}
				<div className="flex flex-col items-center ml-2 border-l border-gray-800 pl-4 py-4">
					<BettingCoinProps lookupId="rating-guess-3x" label="Trio Agree" />
				</div>
			</div>
		</div>
	);
};

export default AssignmentGamblingBoard;
