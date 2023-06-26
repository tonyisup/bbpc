import type { InferGetServerSidePropsType, NextPage } from "next";
import { ssr } from "../server/db/ssr";
import { Episode } from "../components/Episode";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review } from '@prisma/client';

export async function getServerSideProps() {
  const episodes = await ssr.getEpisodeHistory(0, 10);
  return {
    props: {
      episodes: JSON.parse(JSON.stringify(episodes)),
    }
  }
}

const Test: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({episodes}) => {
  return (
    <main className="bg-black flex flex-col w-full min-h-screen text-white items-center">
      <ul>
				{episodes.map((episode:(EpisodeType & {
					Assignment: (AssignmentType & {
							User: User;
							Movie: Movie | null;
					})[];
					Review: (Review & {
							User: User;
							Movie: Movie;
					})[];
				})) => (
					<li key={episode.id}>
						<Episode episode={episode} />
					</li>
				))}
      </ul>

    </main>
  );
};

export default Test;