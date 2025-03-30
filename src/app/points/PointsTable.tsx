'use client';

import { type User } from "@prisma/client";
import { UserPointsEdit } from "./UserPointsEdit";

interface PointsTableProps {
  users: User[];
  isAdmin: boolean;
}

export function PointsTable({ users, isAdmin }: PointsTableProps) {
  return (
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
  );
} 