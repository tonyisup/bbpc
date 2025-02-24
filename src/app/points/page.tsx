import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import { UserPointsEdit } from "./UserPointsEdit";
import { api } from "@/trpc/server";

export default async function PointsPage() {
  const session = await getServerAuthSession();
  const isAdmin = session?.user?.role?.admin ?? false;
  
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

  return (
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-red-600">
          Current Standings
        </h1>
        
        <div className="w-full max-w-2xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-4 text-left">Username</th>
                <th className="p-4 text-left">Current Points</th>
                {isAdmin && <th className="p-4 text-left">Edit Points</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.points?.toString()}</td>
                  {isAdmin && (
                    <td className="p-4">
                      <UserPointsEdit
                        user={user}
                        onPointsUpdated={() => {
                          // This will trigger a server revalidation
                          // when points are updated
                        }}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
} 