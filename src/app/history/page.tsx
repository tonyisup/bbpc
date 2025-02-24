import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const userGuesses = await db.guess.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      episode: true,
      movie: true,
      rating: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">Your History</h1>
        
        <div className="w-full max-w-2xl">
          <div className="grid gap-4">
            {userGuesses.map((guess) => (
              <div
                key={guess.id}
                className="rounded-lg bg-white/10 p-4 hover:bg-white/20"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {guess.movie.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Episode {guess.episode.number}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-400">
                      {guess.value}/4
                    </div>
                    <div className="text-sm text-gray-400">
                      Actual: {guess.rating?.value ?? "Not rated yet"}/4
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 