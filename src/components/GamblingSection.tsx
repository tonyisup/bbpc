'use client'

import { type FC, useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { UndoIcon } from "lucide-react";
import UserPoints from "./UserPoints";

interface GamblingSectionProps {
  assignmentId: string;
  userId: string;
}

const GamblingSection: FC<GamblingSectionProps> = ({ assignmentId, userId }) => {
  const [gamblingPoints, setGamblingPoints] = useState<number>(0);
  const [canSubmitGamblingPoints, setCanSubmitGamblingPoints] = useState<boolean>(false);

  const { data: userPoints } = api.user.points.useQuery(undefined);

  // Fetch gambling points for this assignment
  const { data: assignmentGamblingPoints, refetch: refetchAssignmentGamblingPoints } = api.review.getGamblingPointsForAssignment.useQuery(
    { assignmentId: assignmentId }
  );

  const { mutate: submitGamblingPoints } = api.review.submitGamblingPoints.useMutation({
    onSuccess: () => {
      refetchAssignmentGamblingPoints();
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

  if (!userPoints || Number(userPoints) <= 0) return null;

  return (
    <div className="flex flex-col gap-2 items-center">
      <UserPoints points={Number(userPoints)} showSpendButton={false} />
      {assignmentGamblingPoints && assignmentGamblingPoints.length > 0 && assignmentGamblingPoints[0] && assignmentGamblingPoints[0].points > 0 && (
        <div className="flex gap-2 items-center">
          <p className="text-sm text-gray-300">You have gambled {assignmentGamblingPoints[0].points} points on this assignment!</p>
          <Button
            variant="destructive"
            size="sm"
            className="h-8 w-8 p-0"
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
      <div className="flex gap-2">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <Label className="text-gray-300">Wanna bet?</Label>
            {userPoints && Number(userPoints) > 0 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(1)}>Bet 1</Badge>}
            {userPoints && Number(userPoints) > 5 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(5)}>Bet 5</Badge>}
            {userPoints && Number(userPoints) > 10 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(10)}>Bet 10</Badge>}
            {userPoints && Number(userPoints) > 20 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(20)}>Bet 20</Badge>}
            {userPoints && Number(userPoints) > 50 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(50)}>Bet 50</Badge>}
            {userPoints && Number(userPoints) > 0 && <Badge className="cursor-pointer" onClick={() => handleAutoBet(Number(userPoints))}>ALL IN</Badge>}
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Points here..."
              value={gamblingPoints}
              onChange={(e) => setGamblingPoints(Number(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Button
              disabled={!canSubmitGamblingPoints}
              className="text-gray-300 rounded-md hover:bg-red-800 bg-gradient-to-r from-blue-900 to-blue-500 relative overflow-hidden group"
              onClick={handleGamblingPointsSubmit}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent"></span>
              <span className="px-4 py-2 relative z-10 flex items-center">
                <span className="mr-1">Gamble!</span>
                <span className="animate-bounce inline-block">✨</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamblingSection;
