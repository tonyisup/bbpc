// import { db } from "@/server/db";

// export default async function RatingsPage() {
//   const ratings = await db.rating.findMany({
//     include: {
//       user: true,
//       movie: true,
//     },
//     orderBy: {
//       createdAt: 'desc',
//     },
//   });

//   return (
//     <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
//       <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
//         <h1 className="text-5xl font-extrabold tracking-tight">Ratings</h1>
        
//         <div className="w-full max-w-2xl">
//           <div className="grid gap-4">
//             {ratings.map((rating) => (
//               <div
//                 key={rating.id}
//                 className="rounded-lg bg-white/10 p-4 hover:bg-white/20"
//               >
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold">
//                       {rating.movie.title}
//                     </h3>
//                     <p className="text-sm text-gray-400">
//                       Rated by {rating.user.name}
//                     </p>
//                   </div>
//                   <div className="text-2xl font-bold text-purple-400">
//                     {rating.value}/4
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// } 