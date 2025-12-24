'use client'

import { type FC, useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { UndoIcon } from "lucide-react";
import UserPoints from "./UserPoints";
import { cn } from "@/lib/utils";

/**
 * Props for the GamblingSection component.
 */
interface GamblingSectionProps {
  /** The unique identifier for the assignment where the bet is being placed. */
  assignmentId: string;
  /** The unique identifier for the user placing the bet. */
  userId: string;
}

/**
 * A component that allows users to place bets (gambles) using their earned points on specific assignments.
 * It handles balance checks, auto-betting options, and displaying existing bets.
 */

const GamblingCoins: FC<GamblingSectionProps> = ({ assignmentId, userId }) => {
  const [gamblingPoints, setGamblingPoints] = useState<number>(0);
  const [canSubmitGamblingPoints, setCanSubmitGamblingPoints] = useState<boolean>(false);

  const { data: userPoints, refetch: refetchUserPoints } = api.user.points.useQuery(undefined);

  // Fetch gambling points for this assignment
  const { data: assignmentGamblingPoints, refetch: refetchAssignmentGamblingPoints } = api.review.getGamblingPointsForAssignment.useQuery(
    { assignmentId: assignmentId }
  );

  const utils = api.useUtils();

  const { mutate: submitGamblingPoints } = api.review.submitGamblingPoints.useMutation({
    onSuccess: async () => {
      await Promise.all([
        refetchAssignmentGamblingPoints(),
        utils.user.points.invalidate(),
        refetchUserPoints()
      ]);
    },
    onError: (error) => {
      alert(`Error submitting gambling points: ${error.message}`);
    }
  });

  const handleGamblingPointsSubmit = () => {
    if (!userId) return;
    if (!gamblingPoints) return;

    if (isNaN(gamblingPoints) || gamblingPoints < 0) {
      alert("Please enter a valid number of points");
      return;
    }

    submitGamblingPoints({
      userId: userId,
      assignmentId: assignmentId,
      points: gamblingPoints
    });
  };

  useEffect(() => {
    const evalCanSubmitGamblingPoints = () => {
      if (!userPoints) return false;
      if (Number(userPoints) <= 0) return false;
      if (isNaN(gamblingPoints) || gamblingPoints <= 0) return false;
      if (gamblingPoints > Number(userPoints)) return false;
      return true;
    }

    setCanSubmitGamblingPoints(evalCanSubmitGamblingPoints());
  }, [userPoints, gamblingPoints]);

  const handleAutoBet = (amount: number) => {
    setGamblingPoints(amount);
  }

  if (userPoints === null || userPoints === undefined || Number(userPoints) < 0) return null;

  const hasGambled = () => {
    return assignmentGamblingPoints && assignmentGamblingPoints.length > 0 && assignmentGamblingPoints[0] && assignmentGamblingPoints[0].points > 0;
  }
  return (
    <div className="flex gap-2 items-center">
      <UserPoints points={Number(userPoints)} showSpendButton={false} />
      {hasGambled() && (
        <div className="flex gap-2 items-center">
          <p className="text-sm text-gray-300">You have bet {assignmentGamblingPoints?.[0]?.points ?? "unknown"} points on {assignmentGamblingPoints?.[0]?.Assignment?.Movie?.title ?? "unknown"}!</p>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-1"
            onClick={() => {
              if (!userId) return;
              submitGamblingPoints({
                userId: userId,
                assignmentId: assignmentId,
                points: 0
              });
            }}
          >
            <UndoIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!hasGambled() && (
        <div className="flex gap-2">
          <div className="flex flex-col gap-2">
            <Label className="text-gray-300">Wanna bet?</Label>
            <div className="flex gap-2 items-center flex-wrap">
              {userPoints && Number(userPoints) > 0 && <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(1)}>Bet 1</Badge>}
              {userPoints && Number(userPoints) > 5 && <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(5)}>Bet 5</Badge>}
              {userPoints && Number(userPoints) > 10 && <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(10)}>Bet 10</Badge>}
              {userPoints && Number(userPoints) > 20 && <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(20)}>Bet 20</Badge>}
              {userPoints && Number(userPoints) > 50 && <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(50)}>Bet 50</Badge>}
              {userPoints && Number(userPoints) > 0 && <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(Number(userPoints))}>ALL IN</Badge>}
              <Badge className="cursor-pointer whitespace-nowrap bg-red-200 hover:bg-red-600 hover:text-white" onClick={() => handleAutoBet(0)}>NVM!</Badge>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Points here..."
                value={gamblingPoints}
                onChange={(e) => setGamblingPoints(Number(e.target.value))}
                className="bg-gray-800 border-gray-700 text-white max-w-[100px]"
              />
              <Button
                disabled={!canSubmitGamblingPoints}
                className="text-gray-300 rounded-md bg-transparent hover:bg-red-800 border-[3px] border-red-800 hover:border-red-400 relative overflow-hidden group"
                onClick={handleGamblingPointsSubmit}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent"></span>
                <span className="px-4 py-2 relative z-10 flex items-center">
                  <span className="mr-1">Bet!</span>
                  <span className={cn(canSubmitGamblingPoints ? "animate-bounce" : "", "inline-block")}>✨</span>
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamblingCoins;
