import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { getServerAuthSession } from "@/server/auth";
import "@/styles/globals.css";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import LeaveMessage from "@/components/LeaveMessage";
import { ListenHere } from "@/components/ListenHere";
import NavMenu from "@/components/NavMenu";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bad Boys Podcast",
  description: "Random rants on all things movie",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} dark`}>
        <Providers session={session} headers={headers()}>
          <div className="bg-black flex flex-col min-h-screen items-center">
            <header>
              <nav className="pt-8 w-full flex items-center justify-around bg-[#020202]">
                <div className="flex-grow">

                  <Link href="/">
                    <Image src="/logo-short.png" alt="BBPC Logo" width={120} height={40} />
                  </Link>
                </div>
                <div className="px-4">
                  <LeaveMessage />
                </div>
              </nav>
              <p className="pb-2 text-center text-xs sm:text-lg text-red-900">Random rants on all things movie</p>
            </header>
            <main className="flex-grow">
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


