import { type FC } from "react";
import type { GamblingPoints, GamblingType } from "@prisma/client";

interface GamblingHistoryProps {
  history: (GamblingPoints & {
    GamblingType: GamblingType;
  })[];
}

export const GamblingHistory: FC<GamblingHistoryProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="w-full max-w-4xl border border-gray-700 rounded-xl overflow-hidden bg-gray-900/40 backdrop-blur-sm shadow-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">Gambling History</h3>
        <p className="text-gray-400">No gambling history found.</p>
      </div>
    );
  }

  const pendingBets = history.filter(h => h.successful == null);
  const completedBets = history.filter(h => h.successful != null);

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900/40 backdrop-blur-sm shadow-lg transition-all hover:shadow-xl hover:bg-gray-900/60">
        <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Gambling History</h3>
        </div>

        <div className="p-4 space-y-8">
          {/* Pending Bets Section */}
          {pendingBets.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-indigo-300 pl-2 border-l-4 border-indigo-500">Pending Bets</h4>
              <div className="grid gap-3">
                {pendingBets.map((gamble) => (
                  <div key={gamble.id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-white text-lg">
                        {gamble.GamblingType.title}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {gamble.GamblingType.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-mono">
                        {new Date(gamble.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                    </div>
                    <div className="text-2xl font-bold ml-4 text-gray-400">
                      {gamble.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Bets Section */}
          {completedBets.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-indigo-300 pl-2 border-l-4 border-indigo-500">Completed Bets</h4>
              <div className="grid gap-3">
                {completedBets.map((gamble) => (
                  <div key={gamble.id} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-white text-lg">
                        {gamble.GamblingType.title}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {gamble.GamblingType.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-2 font-mono">
                        {new Date(gamble.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ml-4 ${gamble.successful ? "text-emerald-400" : "text-red-400"}`}>
                      {gamble.successful ? "+" : "-"}{gamble.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};