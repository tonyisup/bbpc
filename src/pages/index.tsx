import type { InferGetServerSidePropsType, NextPage } from "next/types";
import { ListenHere } from "../components/ListenHere";
import { Episode } from "../components/Episode";
import { ssr } from "../server/db/ssr";

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

  return <div className="flex flex-wrap gap-12 justify-evenly">
        <Episode episode={latest} />
        <Episode episode={next} allowGuesses={true} />
      </div>
};

export default Home;
