'use client'

import { type FC, useState } from "react";
import { type GamblingType, type GamblingPoints } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface BettingCoinProps {
	lookupId: string;
	targetHostId?: string;
	label: string;
	gamblingTypes: GamblingType[] | undefined;
	getBetFor: (lookupId: string, targetHostId?: string) => GamblingPoints | undefined;
	submitBet: any;
	userId: string;
	assignmentId: string;
	userPoints: number | undefined;
	episodeStatus: string;
}

const BettingCoin: FC<BettingCoinProps> = ({
	lookupId,
	targetHostId,
	label,
	gamblingTypes,
	getBetFor,
	submitBet,
	userId,
	assignmentId,
	userPoints,
	episodeStatus
}) => {
	const [amount, setAmount] = useState<string>("");
	const type = gamblingTypes?.find(t => t.lookupId === lookupId);
	const existingBet = getBetFor(lookupId, targetHostId);
	const isLocked = episodeStatus === "recording" || episodeStatus === "published" || (existingBet && existingBet.status !== "pending");

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
							disabled={isLocked}
							min="0"
						/>
						<Button
							size="sm"
							onClick={handleBet}
							disabled={submitBet.isLoading || isLocked}
							className="h-8"
						>
							{submitBet.isLoading ? <Loader2 className="animate-spin w-3 h-3" /> : "Bet"}
						</Button>
					</div>
					{isLocked && (
						<p className="text-xs text-amber-500 font-medium italic">
							Bet confirmed and locked.
						</p>
					)}
					{!isLocked && existingBet?.status === "pending" && (
						<Button variant="ghost" size="sm" onClick={() => {
							setAmount("0");
							submitBet.mutate({ userId, gamblingTypeId: type.id, points: 0, assignmentId, targetUserId: targetHostId });
						}} className="h-6 text-[10px] text-red-400 hover:text-red-300">
							Clear Bet
						</Button>
					)}
					<p className="text-[10px] text-gray-500 italic">Balance: {userPoints ?? 0} pts</p>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default BettingCoin;
