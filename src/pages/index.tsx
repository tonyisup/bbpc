import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import ListenHere from "../components/ListenHere";
import Episode from "../components/Episode";
import Image from "next/image";

const Home: NextPage = () => {
  const { data: latestEpisode } = trpc.episode.latest.useQuery();
  const { data: nextEpisode } = trpc.episode.next.useQuery();

  return (
    <>
      <Head>
        <title>Bad Boys Podcast</title>
        <meta name="description" content="Random rants on all things movie" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="w-full">
        <nav className="w-full flex items-center justify-center flex-wrap bg-[#020202]">
          <div className="flex flex-col sm:flex-row items-center flex-shrink-0 text-white mr-6">
            <span className="text-2xl text-red-900">Bad Boys</span>
            <Link href="/"> 
              <Image src="/logo-short.png" alt="BBPC Logo" width={300} height={100} />
            </Link>
            <span className="text-2xl text-red-900">Podcast</span>
          </div>
        </nav>
      </header>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#020202] to-[#424242] text-white ">
        <div className="flex p-2 justify-evenly w-full">
          <div className="flex flex-col items-center justify-center gap-4">
            {latestEpisode && <Episode episodeId={latestEpisode.id} />}
            {nextEpisode && <Episode episodeId={nextEpisode.id} isNextEpisode={true} />}
          </div>
        </div>
        
        <ListenHere />
        
        <AuthShowcase />
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => signOut() : () => signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
