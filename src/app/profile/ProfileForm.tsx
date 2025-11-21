'use client';

import { UserProfile } from "@clerk/nextjs";

interface ProfileFormProps {
  initialName: string;
  initialImage?: string | null;
}

export function ProfileForm({ initialName, initialImage }: ProfileFormProps) {
  // Clerk's UserProfile component handles all profile management
  return (
    <div className="w-full flex justify-center">
      <UserProfile routing="hash" />
    </div>
  );
}
