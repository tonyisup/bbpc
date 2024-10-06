import type { InferGetServerSidePropsType, NextPage } from "next";
import { useState } from "react";
import { ssr } from "../server/db/ssr";
import { Episode } from "../components/Episode";
import type { Assignment as AssignmentType, Episode as EpisodeType, Link as EpisodeLink, Movie, User, Review, ExtraReview } from '@prisma/client';
import { trpc } from "../utils/trpc";
import SearchFilter from "../components/common/SearchFilter";

export async function getServerSideProps() {
  const episodes = await ssr.getEpisodeHistory();
  return {
    props: {
      initialEpisodes: JSON.parse(JSON.stringify(episodes)),
    }
  }
}

const History: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ initialEpisodes }) => {
  const [episodes, setEpisodes] = useState(initialEpisodes);	
	const [searchQuery, setSearchQuery] = useState('');
	const { data: searchResults, refetch: refetchSearch } = trpc.episode.search.useQuery({ query: searchQuery }, {
    onSuccess: (data) => {
			if (searchQuery.trim() === "") return;
      setEpisodes(data);
    },
  });

  const handleSearch = (query: string) => {
    if (query.trim() === "") {
      setEpisodes(initialEpisodes);
    } else {
			setSearchQuery(query);
    }
  };

  return (
    <main className="bg-black flex flex-col w-full min-h-screen text-white items-center">
      <h2 className="text-2xl font-bold mb-4">Episode History</h2>
      <SearchFilter onSearch={handleSearch} />
      <ul className="w-full max-w-4xl">
        {episodes && episodes.map((episode: EpisodeType & {
          assignments: (AssignmentType & {
            User: User;
            Movie: Movie | null;
          })[];
          extras: (ExtraReview & {
            Review: (Review & {
              User: User;
              Movie: Movie;
            })
          })[];
          links: EpisodeLink[];
        }) => (
          <li className="mb-8" key={episode.id}>
            <Episode episode={episode} />
          </li>
        ))}
      </ul>
      {episodes && episodes.length === 0 && (
        <p className="text-gray-400">No episodes found matching your search.</p>
      )}
    </main>
  );
};

export default History;