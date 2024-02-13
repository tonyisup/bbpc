import type { NextPage } from "next";
import RatingIcon from "../components/RatingIcon";
import { trpc } from "../utils/trpc";

const Test: NextPage = () => {
  const { data: ratings } = trpc.movie.ratings.useQuery();

  return (
    <main className="bg-black flex flex-col w-full min-h-screen text-white items-center">
      <ul>
      {ratings && ratings.map((rating) => {
        return (<li key={rating.id} className="p-2 text-xl">
            <RatingIcon value={rating.value} />
          </li>
        )
      })}
      </ul>
    </main>
  );
};

export default Test;