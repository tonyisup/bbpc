import type { InferGetServerSidePropsType, NextPage } from "next";
import { ssr } from "../server/db/ssr";
import { Episode } from "../components/Episode";
import type { Assignment as AssignmentType, Episode as EpisodeType, Link as EpisodeLink, Movie, User, Review, ExtraReview } from '@prisma/client';
import { trpc } from "../utils/trpc";
import { use, useState } from "react";

export async function getServerSideProps() {
  const episodes = await ssr.getEpisodeHistory();
  return {
    props: {
      recent: JSON.parse(JSON.stringify(episodes)),
    }
  }
}

const History: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({recent}) => {
	// ability to search for episodes by assignment movie title
	const [ searchQuery, setSearchQuery ] = useState<string>("");
	const { data: searchResults, refetch: refetchSearch } = trpc.episode.search.useQuery({ query: searchQuery });
	const handleSearch = function() {
		setSearchQuery(searchQuery);
		refetchSearch();
	}
  return (
    <main className="bg-black flex flex-col w-full min-h-screen text-white items-center">
			<h2>Episode History</h2>
			
			{/* <form onSubmit={handleSearch}>
				<input type="text" name="search" placeholder="Search for an episode" />
				<button type="submit">Search</button>
			</form> */}

      <ul>

				{!searchQuery && recent.map((episode:(EpisodeType & {
					assignments: (AssignmentType & {
						User: User;
						Movie: Movie | null;
				})[];
				extras: (ExtraReview & {
					Review: (Review & {
						User: User;
						Movie: Movie;
				})})[];
				links: EpisodeLink[];
				})) => (
					<li className="p-2" key={episode.id}>
						<Episode episode={episode} />
					</li>
				))}
      </ul>
    </main>
  );
};

export default History;