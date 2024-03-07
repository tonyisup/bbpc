import { type AppType } from "next/app";
import { type Session } from "next-auth";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { SessionProvider } from "next-auth/react";
import { Auth } from "../components/Auth";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { ListenHere } from "../components/ListenHere";
import { HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";

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
      <section className="bg-black flex flex-col justify-between items-stretch">
        <header>
          <nav className="w-full flex items-center justify-between bg-[#020202]">
            <div className="p-4">
              <Link href="/"> 
                <Image src="/logo-short.png" alt="BBPC Logo" width={120} height={40} />
              </Link>
            </div>
            <div className="flex-grow">
              <p className="text-center text-xs sm:text-lg text-red-900">Random rants on all things movie</p>
            </div>
            <div>
              <NavMenu />
            </div>            
          </nav>
        </header>
        <main className="flex-grow p-4 bg-gradient-to-b from-[#020202] to-[#424242]">
          <div className="flex flex-col text-white main-mask">
            <Component {...pageProps} />
          </div>
        </main>
        <footer>        
          <ListenHere />
        </footer>
      </section>
    </SessionProvider>
  );
};

function NavMenu() {
  const [showMenu, setShowMenu] = useState(false);
  function handleClick() {
    setShowMenu(!showMenu);
  }
  return (
    <div className="flex flex-between gap-8 text-red-500 mr-4">
      <div className="sm:hidden">
        <HiMenu onClick={handleClick} />
      </div>
      {showMenu && <div className="flex flex-col fixed p-4 justify-center items-center right-0 gap-4 sm:hidden bg-black">
        <HiX onClick={handleClick} />
        <Link href="/">Home</Link>
        <Link href="/history">History</Link>  
        <Auth />
      </div>}
      <div className="gap-4 hidden sm:flex">
        <Link href="/">Home</Link>
        <Link href="/history">History</Link>
        <Auth />
      </div>
    </div>
  );
}
export default trpc.withTRPC(MyApp);
