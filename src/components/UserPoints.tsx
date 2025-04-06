'use client'

import { type FC } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import type { Decimal } from "@prisma/client/runtime/library";

interface UserPointsProps {
  points: Decimal | null;
  showSpendButton?: boolean;
  className?: string;
}

const UserPoints: FC<UserPointsProps> = ({ 
  points, 
  showSpendButton = true,
  className = ""
}) => {
  const pointsValue = points ? Number(points) : 0;
  
  return (
    <div className={`flex gap-4 items-center space-around ${className}`}>
      <div className="mb-6 p-4 bg-gray-800 rounded-lg text-center">
        <h2 className="text-xl font-semibold mb-2">Your Points</h2>
        <p className="text-3xl font-bold text-red-500">{pointsValue}</p>
      </div>
      {showSpendButton && (
        <Button variant="outline">
          <Link href="/game">
            Go Spend Them
          </Link>
        </Button>
      )}
    </div>
  );
};

export default UserPoints; 