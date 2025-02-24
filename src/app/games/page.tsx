import { db } from "@/server/db";
import Link from "next/link";

export default async function GamesPage() {
  const games = await db.game.findMany({
    include: {
      season: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
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
                      Season {game.season.number}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {game.status === 'ACTIVE' ? 'In Progress' : 'Completed'}
                    </p>
                  </div>
                  {game.status === 'ACTIVE' && (
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-400">
                      Active
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 