'use client'

/**
 * Represents an episode of the show.
 */
interface Episode {
	id: string;
	title: string;
	number: number;
}

/**
 * Represents a movie analyzed in an episode.
 */
interface Movie {
	title: string;
}

/**
 * Represents an assignment consisting of an episode and a movie.
 */
interface Assignment {
	id: string;
	episode: Episode;
	movie: Movie;
}

/**
 * Represents a point entry for a user, which can be linked to assignments, gambles, or guesses.
 */
interface Point {
	id: string;
	reason: string | null;
	earnedOn: Date | string;
	adjustment: number | null;
	gamePointType: {
		title: string;
		points: number;
		description: string | null;
	} | null;
	assignmentPoints: {
		assignment: Assignment;
	}[];
	gamblingPoints: {
		assignment: Assignment | null;
		gamblingType: {
			title: string;
		} | null;
	}[];
	guess: {
		assignmentReview: {
			assignment: Assignment;
		};
	}[];
}

/**
 * Props for the PointHistory component.
 */
interface PointHistoryProps {
	/** Array of Point objects to display in the history. */
	points: Point[];
}

/**
 * Render a point history grouped by episode and assignment.
 *
 * Groups the provided points by the associated Episode (derived from Assignment data) and then by Assignment, sorts episodes by episode number descending, and renders each assignment's points with titles, descriptions, earned date, and computed totals.
 *
 * @param points - Array of Point objects to display. Points without an associated Assignment are placed under "Miscellaneous" -> "General".
 * @returns The JSX element representing the grouped and formatted point history.
 */
export default function PointHistory({ points }: PointHistoryProps) {
	// Group points by Episode -> Assignment
	const groupedPoints = points.reduce((acc, point) => {
		let episodeId = "misc";
		let episodeTitle = "Miscellaneous";
		let episodeNumber = -1;
		let assignmentId = "misc";
		let assignmentTitle = "General";

		// Try to find associated assignment and episode
		let assignment: Assignment | null | undefined;

		if (point.assignmentPoints.length > 0) {
			assignment = point.assignmentPoints[0]?.assignment;
		} else if (point.gamblingPoints.length > 0) {
			assignment = point.gamblingPoints[0]?.assignment;
		} else if (point.guess.length > 0) {
			assignment = point.guess[0]?.assignmentReview.assignment;
		}

		if (assignment) {
			episodeId = assignment.episode.id;
			episodeTitle = `Episode ${assignment.episode.number}: ${assignment.episode.title}`;
			episodeNumber = assignment.episode.number;
			assignmentId = assignment.id;
			assignmentTitle = assignment.movie.title;
		}

		if (!acc[episodeId]) {
			acc[episodeId] = {
				title: episodeTitle,
				number: episodeNumber,
				assignments: {}
			};
		}

		const episodeGroup = acc[episodeId];
		if (episodeGroup) {
			if (!episodeGroup.assignments[assignmentId]) {
				episodeGroup.assignments[assignmentId] = {
					title: assignmentTitle,
					points: []
				};
			}
			episodeGroup.assignments[assignmentId]?.points.push(point);
		}
		return acc;
	}, {} as Record<string, { title: string; number: number; assignments: Record<string, { title: string; points: Point[] }> }>);

	// Sort episodes by number (descending)
	const sortedEpisodes = Object.entries(groupedPoints).sort(([, a], [, b]) => b.number - a.number);

	return (
		<div className="w-full max-w-4xl space-y-6">
			<h3 className="text-2xl font-bold text-white mb-6">Point History</h3>
			{sortedEpisodes.map(([episodeId, episode]) => (
				<div key={episodeId} className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900/40 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl hover:bg-gray-900/60">
					<div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
						<h4 className="text-xl font-bold text-white">{episode.title}</h4>
					</div>
					<div className="p-4 space-y-6">
						{Object.entries(episode.assignments).map(([assignmentId, assignment]) => (
							<div key={assignmentId} className="relative pl-6 border-l-2 border-indigo-500/50">
								<h5 className="text-lg font-semibold mb-3 text-indigo-300">{assignment.title}</h5>
								<div className="grid gap-3">
									{assignment.points.map(point => {
										const totalPoints = (point.gamePointType?.points ?? 0) + (point.adjustment ?? 0);
										return (
											<div key={point.id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
												<div className="flex-1">
													<div className="font-medium text-white text-lg">
														{point.gamePointType?.title || point.reason || "Point Adjustment"}
													</div>
													{point.gamePointType?.description && (
														<div className="text-sm text-gray-400 mt-1">
															{point.gamePointType.description}
														</div>
													)}
													<div className="text-xs text-gray-500 mt-2 font-mono">
														{new Date(point.earnedOn).toLocaleDateString(undefined, { dateStyle: 'long' })}
													</div>
												</div>
												<div className={`text-2xl font-bold ml-4 ${totalPoints > 0
													? 'text-emerald-400'
													: 'text-red-400'
													}`}>
													{totalPoints > 0 ? '+' : ''}
													{totalPoints}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}