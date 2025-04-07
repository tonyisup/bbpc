import { type FC } from "react";
import type { GamblingPoints, Assignment, Movie } from "@prisma/client";
import Link from "next/link";

interface GamblingHistoryProps {
  history: (GamblingPoints & {
    Assignment: Assignment & {
      Movie: Movie;
    };
  })[];
}

export const GamblingHistory: FC<GamblingHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return <div className="text-gray-400">No gambling history</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gambling History</h2>
      <div className="space-y-2">
        {history.filter(h => h.successful == null).map((gamble) => (
          <div key={gamble.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <Link href={`/assignment/${gamble.assignmentId}`} className="hover:text-blue-400">
              {gamble.Assignment.Movie.title} ({gamble.Assignment.Movie.year})
            </Link>
            <span className="text-gray-400">{gamble.points} points</span>
            <span className="text-gray-400">{gamble.createdAt.toLocaleDateString()}</span>
          </div>
        ))}
        {history.filter(h => h.successful != null).map((gamble) => (
          <div key={gamble.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
            <Link href={`/assignment/${gamble.assignmentId}`} className="hover:text-blue-400">
              {gamble.Assignment.Movie.title} ({gamble.Assignment.Movie.year})
            </Link>
            <span className={gamble.successful ? "text-green-400" : "text-red-400"}>
              {gamble.successful ? "+" : "-"}{gamble.points} points
            </span>
            <span className="text-gray-400">{gamble.createdAt.toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 