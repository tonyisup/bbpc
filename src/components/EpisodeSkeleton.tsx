import { Skeleton } from "./ui/skeleton";

export const EpisodeSkeleton = () => {
  return (
    <section className="px-2 bg-transparent outline-2 outline-gray-500 outline rounded-2xl flex flex-col gap-2 justify-between">
      <div>
        <div className="flex justify-around items-baseline gap-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="w-full text-center mt-2">
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
        <div className="flex gap-2 justify-around mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center justify-between gap-2">
              <Skeleton className="h-32 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <Skeleton className="h-4 w-16 mx-auto" />
        <div className="flex justify-center gap-2 flex-wrap mt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-20" />
          ))}
        </div>
      </div>
    </section>
  );
}; 