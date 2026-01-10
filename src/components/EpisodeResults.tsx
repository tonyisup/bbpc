'use client'

import { Trophy, Target, Coins, User as UserIcon } from "lucide-react";
import Image from "next/image";
import RatingIcon from "./RatingIcon";
import { cn } from "@/lib/utils";

interface EpisodeResultsProps {
	assignments: any[];
}

export default function EpisodeResults({ assignments }: EpisodeResultsProps) {
	// Aggregate results across all assignments
	const winningGambles = assignments.flatMap(a =>
		a.gamblingPoints.filter((gp: any) => gp.status === 'won').map((gp: any) => ({
			...gp,
			movieTitle: a.movie?.title,
			moviePoster: a.movie?.poster
		}))
	);

	const winningGuesses = assignments.flatMap(a =>
		a.assignmentReviews.flatMap((ar: any) =>
			ar.guesses.filter((g: any) => g.ratingId === ar.review.ratingId).map((g: any) => ({
				...g,
				movieTitle: a.movie?.title,
				moviePoster: a.movie?.poster,
				hostName: ar.review.user.name,
				actualRating: ar.review.rating.value
			}))
		)
	);

	if (winningGambles.length === 0 && winningGuesses.length === 0) {
		return null;
	}

	return (
		<div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			<div className="flex items-center gap-3 border-l-4 border-yellow-500 pl-4">
				<Trophy className="w-8 h-8 text-yellow-500" />
				<h2 className="text-3xl font-black uppercase tracking-tighter text-white">Episode Results</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Winning Gambles */}
				{winningGambles.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-widest text-xs">
							<Coins className="w-4 h-4" />
							Big Winners (Gambles)
						</div>
						<div className="grid gap-3">
							{winningGambles.map((win) => (
								<div key={win.id} className="flex items-center gap-4 bg-purple-900/10 border border-purple-500/20 p-3 rounded-xl backdrop-blur-sm group hover:bg-purple-900/20 transition-all">
									<div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
										{win.moviePoster && (
											<Image
												src={win.moviePoster}
												alt={win.movieTitle}
												fill
												className="object-cover"
											/>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-bold text-white truncate">{win.user.name}</span>
											<span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
												+{Math.floor(win.points * win.gamblingType.multiplier)} PTS
											</span>
										</div>
										<div className="text-xs text-gray-400 truncate mt-0.5">
											on <span className="text-gray-300 font-medium">{win.movieTitle}</span>
										</div>
										<div className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest mt-1">
											{win.gamblingType.title}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Winning Guesses */}
				{winningGuesses.length > 0 && (
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-xs">
							<Target className="w-4 h-4" />
							Sharp Shooters (Guesses)
						</div>
						<div className="grid gap-3">
							{winningGuesses.map((guess) => (
								<div key={guess.id} className="flex items-center gap-4 bg-indigo-900/10 border border-indigo-500/20 p-3 rounded-xl backdrop-blur-sm group hover:bg-indigo-900/20 transition-all">
									<div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
										{guess.moviePoster && (
											<Image
												src={guess.moviePoster}
												alt={guess.movieTitle}
												fill
												className="object-cover opacity-40 group-hover:opacity-60 grayscale-[0.5] group-hover:grayscale-0 transition-all"
											/>
										)}
										<div className="absolute inset-0 flex items-center justify-center group-hover:rotate-12 transition-transform">
											<RatingIcon value={guess.actualRating} />
										</div>
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-bold text-white truncate">{guess.user.name}</span>
											<span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
												CORRECT
											</span>
										</div>
										<div className="text-xs text-gray-400 truncate mt-0.5">
											Predicted <span className="text-gray-300 font-medium">{guess.hostName}&apos;s</span> rating
										</div>
										<div className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-widest mt-1">
											for {guess.movieTitle}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
