'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { api } from '@/trpc/react';

export function GameTeaser() {
  const { data: hasActiveSeason } = api.season.hasActiveSeason.useQuery();

  if (hasActiveSeason === false) return null;

  return (
    <section className="w-full max-w-md mx-auto px-4 py-3 bg-gray-900/30 outline outline-2 outline-gray-500 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-red-400" />
          <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">Prediction Game</span>
        </div>
        <Link
          href="/game"
          className="text-xs text-gray-400 hover:text-white transition-colors underline underline-offset-2"
        >
          Play now
        </Link>
      </div>
      <p className="text-sm text-gray-300 text-center">
        Guess what rating each host will give the next movies. Earn points, climb the leaderboard.
      </p>
      <Link
        href="/game"
        className="block w-full text-center py-2 rounded-lg bg-red-600/20 border border-red-500/30 text-sm font-medium text-red-300 transition-colors hover:bg-red-600/30"
      >
        Make your predictions
      </Link>
    </section>
  );
}
