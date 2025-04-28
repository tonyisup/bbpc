import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { PointsTable } from "./PointsTable";

export default async function PointsPage() {
  const session = await getServerAuthSession();
  const isAdmin = session?.user?.isAdmin ?? false;
  
  const users = await db.user.findMany({
    orderBy: {
      points: 'desc',
    },
    where: {
      points: {
        not: null,
      },
    },
  });

  if (!isAdmin) {
    return (
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        Nope
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight text-red-600">
        Current Standings
      </h1>
      
      <PointsTable users={users} isAdmin={isAdmin} />
    </div>
  );
} 