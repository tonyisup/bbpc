import { type FC } from "react";
import Assignment from "./Assignment";
import MovieInlinePreview from "./MovieInlinePreview";
import ShowInlinePreview from "./ShowInlinePreview";
import { highlightText } from "@/utils/text";
import { RouterOutputs } from "@/utils/trpc";
import Link from "next/link";

/**
 * Represents an episode with all its related assignments, extras, and links.
 */
export type CompleteEpisode = NonNullable<RouterOutputs['episode']['next']>;

/**
 * Props for the Episode component.
 */
interface EpisodeProps {
	/** The complete episode data. */
	episode: CompleteEpisode;
}

/**
 * Renders the latest episode with specific layout:
 * - Header (Number, Title, Date)
 * - Content Row: Assignments (Left, Large) + Extras (Right, Small, Scrollable)
 * - Audio Player
 */
export const LatestEpisode: FC<EpisodeProps> = ({ episode }) => {
	if (!episode) return null;

	const sortedAssignments = [...episode.assignments].sort((a, b) => {
		const typeOrder = { "HOMEWORK": 0, "EXTRA_CREDIT": 1, "BONUS": 2 };
		return (typeOrder[a.type as keyof typeof typeOrder] ?? 99) - (typeOrder[b.type as keyof typeof typeOrder] ?? 99);
	});

	return (
		<section className="w-full max-w-4xl mx-auto px-4 py-4 bg-transparent outline-2 outline-gray-500 outline rounded-2xl flex flex-col gap-4">
			{/* Header */}
			<div className="flex justify-between items-center gap-2 font-bold px-1 sm:justify-around sm:items-baseline">
				<div className="text-sm sm:text-md p-1 sm:p-2 whitespace-nowrap">
					<Link href={`/episodes/${episode.id}`}>
						{episode?.number}
					</Link>
				</div>
				<div className="text-lg sm:text-xl md:text-2xl p-2 flex-grow flex justify-center items-center text-center gap-2 leading-tight">
					{!episode?.recording && episode?.title}
					{episode?.recording && <Link className="underline hover:text-gray-300" title={episode?.title} href={`/episodes/${episode.id}`}>
						{episode?.title}
					</Link>}
				</div>
				<div className="text-sm sm:text-md p-1 sm:p-2 whitespace-nowrap">
					{episode?.date && <p>{new Date(episode.date).toLocaleDateString("en-us", { month: "2-digit", day: "2-digit", year: "2-digit" })}</p>}
				</div>
			</div>

			{/* Content Area: Assignments + Extras */}
			<div className="flex flex-col md:flex-row gap-1 overflow-hidden relative">
				{/* Assignments (Left, Fixed/Large) */}
				{sortedAssignments.length > 0 && (
					<div className="flex-shrink-0 flex justify-center md:justify-start gap-1 z-10 bg-black/50 md:bg-transparent md:p-0 rounded-lg">
						{sortedAssignments.map((assignment) => (
							<div key={assignment.id} className="flex-shrink-0">
								{assignment.movie && (
									<MovieInlinePreview
										movie={assignment.movie}
										responsive={true}
										imageClassName="w-[48px] h-[72px] sm:w-[96px] sm:h-[144px]"
									/>
								)}
							</div>
						))}
						{episode.extras.length > 0 && <div className="w-[2px] bg-gray-500 self-stretch opacity-30" />}
						<div className="flex-grow min-w-0 overflow-x-scroll flex items-center gap-2 pb-2">
							{episode.extras.map((extra) => (
								<div key={extra.id} className="flex-shrink-0">
									{extra.review.movie && (
										<MovieInlinePreview
											movie={extra.review.movie}
											responsive={true}
											imageClassName="w-[48px] h-[72px] sm:w-[96px] sm:h-[144px]"
										/>
									)}
									{extra.review.show && (
										<ShowInlinePreview
											show={extra.review.show}
											responsive={true}
											imageClassName="w-[48px] h-[72px] sm:w-[96px] sm:h-[144px]"
										/>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Audio Player */}
			{episode.recording && (
				<div className="w-full mt-2">
					<audio
						controls
						className="w-full h-10 block"
						src={episode.recording}
					>
						Your browser does not support the audio element.
					</audio>
				</div>
			)}
		</section>
	);
}
