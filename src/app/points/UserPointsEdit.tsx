// 'use client';

// import { type User } from "@prisma/client";
// import { useState } from "react";
// import { HiMinusCircle, HiOutlineArrowCircleLeft, HiOutlineMinusCircle, HiOutlinePlusCircle, HiPlusCircle } from "react-icons/hi";
// import { api } from "@/trpc/react";

// interface UserPointsEditProps {
//   user: User;
//   onPointsUpdated: () => void;
// }

// export function UserPointsEdit({ user, onPointsUpdated }: UserPointsEditProps) {
//   const [pointsToAdd, setPointsToAdd] = useState<number>(0);
  
//   const addPoints = api.game.addPointsToUser.useMutation({
//     onSuccess: () => {
//       onPointsUpdated();
//     },
//   });

//   const handleSave = () => {
//     addPoints.mutate({ userId: user.id, points: pointsToAdd });
//     setPointsToAdd(0);
//   };

//   const handleAddOne = () => setPointsToAdd(pointsToAdd + 1);
//   const handleSubtractOne = () => setPointsToAdd(pointsToAdd - 1);
//   const handleAddHalf = () => setPointsToAdd(pointsToAdd + 0.5);
//   const handleSubtractHalf = () => setPointsToAdd(pointsToAdd - 0.5);

//   return (
//     <div className="p-2 grid grid-cols-4 gap-2 space-between items-center">
//       {pointsToAdd !== 0 ? (
//         <HiOutlineArrowCircleLeft
//           onClick={handleSave}
//           title="Add and save"
//           className="cursor-pointer text-2xl"
//         />
//       ) : (
//         <HiOutlineArrowCircleLeft className="text-2xl text-gray-500 cursor-not-allowed" />
//       )}
//       <span className="text-lg font-bold">{pointsToAdd}</span>
//       <div className="flex flex-col items-center gap-1">
//         <button type="button" title="+1" onClick={handleAddOne}>
//           <HiPlusCircle className="text-xl" />
//         </button>
//         <button type="button" title="-1" onClick={handleSubtractOne}>
//           <HiMinusCircle className="text-xl" />
//         </button>
//       </div>
//       <div className="flex flex-col items-center gap-1">
//         <button type="button" title="+0.5" onClick={handleAddHalf}>
//           <HiOutlinePlusCircle />
//         </button>
//         <button type="button" title="-0.5" onClick={handleSubtractHalf}>
//           <HiOutlineMinusCircle />
//         </button>
//       </div>
//     </div>
//   );
// } 