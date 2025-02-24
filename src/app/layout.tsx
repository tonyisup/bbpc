import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { getServerAuthSession } from "@/server/auth";
import "@/styles/globals.css";
import Head from "next/head";
import Link from "next/link";
import LeaveMessage from "@/components/LeaveMessage";
import { ListenHere } from "@/components/ListenHere";
import NavMenu from "@/components/NavMenu";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "BBPC",
  description: "BBPC Application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  
  return (
    <html lang="en">
      <Head>
        <title>Bad Boys Podcast</title>
        <meta name="description" content="Random rants on all things movie" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className={`font-sans ${inter.variable}`}>
        <Providers session={session} headers={headers()}>
          <div className="bg-black flex flex-col justify-between items-stretch min-h-screen">
            <header>
              <nav className="w-full flex items-center justify-between bg-[#020202]">
                <div className="p-4">
                  <Link href="/"> 
                    <img src="/logo-short.png" alt="BBPC Logo" width={120} height={40} />
                  </Link>
                </div>
                <div className="px-4">
                  <LeaveMessage />
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
                {children}
              </div>
            </main>
            <footer>
              <ListenHere />
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
} 


