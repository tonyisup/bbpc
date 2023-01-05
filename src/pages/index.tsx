import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";
import ListenHere from "../components/ListenHere";
import Episode from "../components/Episode";

const Home: NextPage = () => {
  const { data: nextEpisode } = trpc.episode.next.useQuery();
  const { data: latestEpisode } = trpc.episode.latest.useQuery();
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
              <img src="/logo-short.png" className="w-48 sm:w-64" />
            </Link>
            <span className="text-2xl text-red-900">Podcast</span>
            {/* <svg
              className="fill-current h-8 w-8 mr-2"
              width="54"
              height="54"
              viewBox="0 0 54 54"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M27 0C12.088 0 0 12.088 0 27s12.088 27 27 27 27-12.088 27-27S41.912 0 27 0zm0 51C13.745 51 3 40.255 3 27S13.745 3 27 3s24 10.745 24 24-10.745 24-24 24z" />
            </svg> */}
          </div>
        </nav>
      </header>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#020202] to-[#424242] text-white ">
        <div className="flex p-2 justify-evenly w-full">
          <div className="flex flex-col items-center justify-center gap-4">
            {latestEpisode && <Episode episodeId={latestEpisode.id} />}
            {nextEpisode && <Episode episodeId={nextEpisode.id} allowMoreExtras={true} />}
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
