import type { InferGetServerSidePropsType, NextPage } from "next";
import { ssr } from "../server/db/ssr";
import { Episode } from "../components/Episode";
import type { Assignment as AssignmentType, Episode as EpisodeType, Movie, User, Review } from '@prisma/client';

export async function getServerSideProps() {
  const episodes = await ssr.getEpisodeHistory();
  return {
    props: {
      recent: JSON.parse(JSON.stringify(episodes)),
    }
  }
}

const Test: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({recent}) => {
  return (
    <main className="bg-black flex flex-col w-full min-h-screen text-white items-center">
      <ul>
				{recent.map((episode:(EpisodeType & {
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