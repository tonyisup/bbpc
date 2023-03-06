import type { InferGetServerSidePropsType, InferGetStaticPropsType, NextPage } from "next";
import { ListenHere } from "../components/ListenHere";
import { Episode } from "../components/Episode";
import { Auth } from "../components/Auth";
import { ssr } from "../server/db/ssr";
import { AddExtraToNext } from "../components/AddExtraToNext";

export async function getStaticProps() {
  const latestEpisode = await ssr.getLatestEpisode();
  const nextEpisode = await ssr.getNextEpisode();
  return {
    revalidate: 1440,
    props: {
      latest: JSON.parse(JSON.stringify(latestEpisode)),
      next: JSON.parse(JSON.stringify(nextEpisode))
    }
  }
}

const Home: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({ latest, next }) => {

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
