import { db } from "@/server/db";
import Link from "next/link";
import type { GameType } from "@prisma/client";

export default async function GamesPage() {
  const games = await db.gameType.findMany({
    include: {
      seasons: true,
    },
    orderBy: {
      id: 'desc',
    },
  });

  return (
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">Games</h1>
        
        <div className="w-full max-w-2xl">
          <div className="grid gap-4">
            {games.map((game) => (
              <Link
                key={game.id}
                href={`/game/${game.id}`}
                className="rounded-lg bg-white/10 p-4 transition hover:bg-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {game.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {game.seasons.length} Season{game.seasons.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
  );
} 