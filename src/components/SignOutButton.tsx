'use client'

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { type FC } from "react";

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

const SignOutButton: FC<SignOutButtonProps> = ({ 
  variant = "outline",
  className
}) => {
  return (
    <ClerkSignOutButton>
      <Button
        variant={variant}
        className={className}
      >
        Sign Out
      </Button>
    </ClerkSignOutButton>
  );
};

export default SignOutButton;
