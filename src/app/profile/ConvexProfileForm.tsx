"use client";

import { useConvex } from "convex/react";
import { useEffect, useState } from "react";

import { useBbpcAuth } from "@/components/auth/BbpcAuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getConvexIdentityIssue,
  updateConvexProfileName,
} from "@/convex/identity";

interface ConvexProfileFormProps {
  initialName: string;
  initialImage: string | null;
}

function saveErrorMessage(error: unknown): string {
  switch (getConvexIdentityIssue(error)) {
    case "linking-disabled":
      return "Profile updates are paused while this environment is read-only.";
    case "stale-client":
      return "This page is out of date. Refresh it before saving again.";
    case "account-disabled":
    case "identity-conflict":
      return "This account needs an administrator to resolve it.";
    default:
      return "Your profile could not be updated. Please try again.";
  }
}

export function ConvexProfileForm({
  initialName,
  initialImage,
}: ConvexProfileFormProps) {
  const convex = useConvex();
  const { refreshAccount } = useBbpcAuth();
  const [userName, setUserName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setUserName(initialName);
    }
  }, [initialName, isEditing]);

  const save = async () => {
    const normalizedName = userName.trim();
    if (normalizedName.length < 1 || normalizedName.length > 100) {
      setErrorMessage("Display name must contain 1 through 100 characters.");
      return;
    }
    setIsSaving(true);
    setSaved(false);
    setErrorMessage(null);
    try {
      const result = await updateConvexProfileName(convex, normalizedName);
      setUserName(result.name);
      setIsEditing(false);
      setSaved(true);
      refreshAccount();
    } catch (error) {
      setErrorMessage(saveErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-end justify-between gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={initialImage ?? ""} alt={userName} />
          <AvatarFallback>
            {userName.charAt(0).toUpperCase() || "P"}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Display Name
          </label>
          <input
            id="name"
            type="text"
            value={userName}
            maxLength={100}
            onChange={(event) => {
              setUserName(event.target.value);
              setIsEditing(true);
              setSaved(false);
              setErrorMessage(null);
            }}
            className="rounded-md border border-gray-700 bg-gray-800 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {isEditing ? (
        <div className="flex flex-row justify-center gap-4">
          <Button
            variant="destructive"
            onClick={() => {
              setUserName(initialName);
              setIsEditing(false);
              setErrorMessage(null);
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button variant="outline" onClick={save} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      ) : null}

      {saved ? (
        <p className="text-center text-sm text-green-400" role="status">
          Profile updated successfully.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="text-center text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <p className="text-xs text-zinc-500">
        Profile image changes remain paused until durable media handling moves
        to Convex.
      </p>
    </div>
  );
}
