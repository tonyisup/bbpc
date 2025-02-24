'use client';

import { useState } from "react";
import { signOut } from "next-auth/react";
import { api } from "@/trpc/react";

interface ProfileFormProps {
  initialName: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
  const [userName, setUserName] = useState(initialName);
  const [saved, setSaved] = useState(false);

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSave = () => {
    updateUser.mutate({ name: userName });
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="rounded-full bg-white/10 px-4 py-2 font-semibold text-red-400 no-underline transition hover:bg-white/20"
        onClick={() => signOut()}
      >
        Sign Out
      </button>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          Display Name
        </label>
        <input
          id="name"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={updateUser.isLoading}
        className="rounded-md bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
      >
        {updateUser.isLoading ? "Saving..." : "Save Changes"}
      </button>

      {saved && (
        <p className="text-center text-sm text-green-400">
          Profile updated successfully!
        </p>
      )}
    </div>
  );
} 