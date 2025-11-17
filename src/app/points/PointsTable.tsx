'use client';

import { type User } from "@prisma/client";
import { UserPointsEdit } from "./UserPointsEdit";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { revalidate } from "./_actions";

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
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {user.image && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name ?? ""} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  {user.name}
                </div>
              </td>
              <td className="p-4">{user.points?.toString()}</td>
              {isAdmin && (
                <td className="p-4">
                  <UserPointsEdit
                    user={user}
                    onPointsUpdated={() => {
                      revalidate();
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