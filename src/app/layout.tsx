import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
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
      <body className={`font-sans ${inter.variable} dark`}>
        <Providers session={session} headers={headers()}>
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


