import { type AppType } from "next/app";
import { type Session } from "next-auth";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import { Auth } from "../components/Auth";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      
      <Head>
        <title>Bad Boys Podcast</title>
        <meta name="description" content="Random rants on all things movie" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="w-full">
        <nav className="w-full flex items-center justify-center flex-wrap bg-[#020202]">
          <div className="flex flex-col items-center gap-4">
						<div className="flex flex-col sm:flex-row items-center flex-shrink-0 text-white mr-6">
							<span className="text-2xl text-red-900">Bad Boys</span>
							<Link href="/"> 
								<Image src="/logo-short.png" alt="BBPC Logo" width={300} height={100} />
							</Link>
							<span className="text-2xl text-red-900">Podcast</span>
						</div>
						<div>
							<p className="text-xs text-red-900">Random rants on all things movie</p>
						</div>
						<div className="mb-8">
							<Link className="text-md text-red-500" href="/history">Episode History</Link>
						</div>
					</div>
        </nav>
      </header>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#020202] to-[#424242] text-white ">
        <Component {...pageProps} />
				
				<Auth />
      </main>
			
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
