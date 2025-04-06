'use client'

import { signOut } from "next-auth/react";
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
    <Button 
      variant={variant} 
      onClick={() => signOut()}
      className={className}
    >
      Sign Out
    </Button>
  );
};

export default SignOutButton; 