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
		const type = gamblingTypes?.find(t => t.lookupId === lookupId);
		if (!type) return undefined;
		return myBets?.find(b =>
			b.gamblingTypeId === type.id &&
			(!targetHostId || (b as any).targetUserId === targetHostId)
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
								disabled={existingBet?.successful !== null && existingBet?.successful !== undefined}
							/>
							<Button
								size="sm"
								onClick={handleBet}
								disabled={submitBet.isLoading || (existingBet?.successful !== null && existingBet?.successful !== undefined)}
								className="h-8"
							>
								{submitBet.isLoading ? <Loader2 className="animate-spin w-3 h-3" /> : "Bet"}
							</Button>
						</div>
						{existingBet?.successful !== null && existingBet?.successful !== undefined && (
							<p className="text-[10px] text-amber-500 font-medium italic">
								Bet confirmed and locked.
							</p>
						)}
						{existingBet && (existingBet.successful === null || existingBet.successful === undefined) && (
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
		<div className="flex flex-col items-center gap-2 p-6 bg-gray-900/30 rounded-2xl border border-gray-800 shadow-inner max-w-2xl mx-auto w-full">
			<div className="relative grid grid-cols-7 w-full items-center">
				<span className="absolute top-0 right-0 text-[10px] text-gray-500 font-bold mb-1 opacity-70">Wanna bet?</span>

				{/* Row 1: Top Arch Bet (2x) - MCP & Harley */}
				<div className="col-start-1 col-span-5 row-start-1 relative flex justify-center h-20">
					<div className="absolute top-10 w-[85%] h-14 border-t-2 border-x-2 border-gray-700 rounded-t-[120px] pointer-events-none opacity-50" />
					<div className="z-10 px-4 py-1 rounded-full self-start">
						<BettingCoinProps lookupId="rating-guess-2x" label="MCP & Harley" />
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
					<BettingCoinProps lookupId="rating-guess-3x" label="All Three" />
				</div>

				{/* Row 3: 1x Bets */}
				<div className="col-start-1 row-start-3 flex flex-col items-center">
					<span className="text-[10px] text-gray-500 font-bold mb-1 opacity-70">1x</span>
					<BettingCoinProps lookupId="rating-guess-1x" targetHostId={hosts[0]?.id} label={hosts[0]?.name?.split(' ')[0] ?? ""} />
				</div>
				<div className="col-start-3 row-start-3 flex flex-col items-center">
					<span className="text-[10px] text-gray-500 font-bold mb-1 opacity-70">1x</span>
					<BettingCoinProps lookupId="rating-guess-1x" targetHostId={hosts[1]?.id} label={hosts[1]?.name?.split(' ')[0] ?? ""} />
				</div>
				<div className="col-start-5 row-start-3 flex flex-col items-center">
					<span className="text-[10px] text-gray-500 font-bold mb-1 opacity-70">1x</span>
					<BettingCoinProps lookupId="rating-guess-1x" targetHostId={hosts[2]?.id} label={hosts[2]?.name?.split(' ')[0] ?? ""} />
				</div>

				{/* Row 4: Pair Agree Bets (positioned between hosts) */}
				<div className="col-start-2 row-start-4 flex flex-col items-center">
					<div className="w-12 h-4 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-50 mb-1" />
					<div className="whitespace-nowrap flex justify-center">
						<BettingCoinProps lookupId="rating-guess-2x" label="MCP & Fonso" />
					</div>
				</div>
				<div className="col-start-4 row-start-4 flex flex-col items-center">
					<div className="w-12 h-4 border-b-2 border-x-2 border-gray-700 rounded-b-xl opacity-50 mb-1" />
					<div className="whitespace-nowrap flex justify-center">
						<BettingCoinProps lookupId="rating-guess-2x" label="Fonso & Harley" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AssignmentGamblingBoard;
