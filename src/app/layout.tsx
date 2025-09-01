import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerAuthSession } from "@/server/auth";
import "@/styles/globals.css"
import Link from "next/link";
import Image from "next/image";
import LeaveMessage from "@/components/LeaveMessage";
import { ListenHere } from "@/components/ListenHere";
import { Providers } from "@/components/Providers";
import NavMenu from "@/components/NavMenu";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bad Boys Podcast",
  description: "Random rants on all things movie",
  manifest: "/manifest.json",
  themeColor: "black",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bad Boys Podcast",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="description" content="Random rants on all things movie" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="black" />
        <meta name="google-site-verification" content="SC5A9TotM4gBLo9UVqxKOyJG-d4Soj6ayNxE5lk9HNs" />
        <title>Bad Boys Podcast</title>
      </head>
      <body className={`font-sans ${inter.variable} dark`}>
        <Providers session={session}>
          <div className="bg-black w-full flex flex-col min-h-screen items-center">
            <header className="flex sm:w-1/2 w-full items-center justify-between bg-[#020202]">
                <NavMenu />
                <div>
                  <Link href="/">
                    <Image src="/logo-short.png" alt="BBPC Logo" width={120} height={40} />
                  </Link>
                </div>
                <div className="px-4">
                  <LeaveMessage />
                </div>
            </header>
            <section>
              <p className="pb-2 text-center text-xs sm:text-lg text-red-900">Random rants on all things movie</p>
            </section>
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


