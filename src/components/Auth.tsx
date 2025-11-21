'use client';

import { SignInButton as ClerkSignInButton, UserButton, useUser } from "@clerk/nextjs";
import type { FC } from "react";

export const SignInButton: FC<{ className?: string }> = ({ className }) => (
  <ClerkSignInButton mode="modal">
    <button
      type="button"
      title="Sign in"
      className={`font-semibold text-red-600 no-underline transition hover:text-red-400 ${className ?? ''}`}
    >
      Sign in
    </button>
  </ClerkSignInButton>
);

export const Auth: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) {
    return <div className="animate-pulse w-8 h-8 rounded-full bg-gray-700" />;
  }
  
  if (!isSignedIn) {
    return <SignInButton />;
  }

  return <UserButton afterSignOutUrl="/" />;
};
