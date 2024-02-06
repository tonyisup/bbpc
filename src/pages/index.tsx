import type { InferGetServerSidePropsType, NextPage } from "next/types";
import { ListenHere } from "../components/ListenHere";
import { Episode } from "../components/Episode";
import { Auth } from "../components/Auth";
import { ssr } from "../server/db/ssr";
import { AddExtraToNext } from "../components/AddExtraToNext";

export async function getServerSideProps() {
  const latestEpisode = await ssr.getLatestEpisode();
  const nextEpisode = await ssr.getNextEpisode();
  return {
    props: {
      latest: JSON.parse(JSON.stringify(latestEpisode[0])),
      next: JSON.parse(JSON.stringify(nextEpisode))
    }
  }
}

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ latest, next }) => {

  return (
    <>
      <div className="flex p-2 justify-evenly w-full">
        <div className="flex flex-col items-center justify-center gap-4">
          {latest && <Episode episode={latest} /> }
          {next && <Episode episode={next} /> }
          {next && <AddExtraToNext episode={next} /> }
        </div>
      </div>
      
      <ListenHere />
      
      <Auth />
    </>
  );
};

export default Home;
