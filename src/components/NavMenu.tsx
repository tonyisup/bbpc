'use client'

import type { FC } from "react";
import Link from "next/link";
import { HomeIcon, HistoryIcon, GamepadIcon, UserIcon, ShirtIcon, LogIn, LogOut, BookOpenIcon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent
} from "@/components/ui/navigation-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

const NavMenu: FC = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <NavigationMenu orientation="vertical">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            {isSignedIn && user ? (
              <Avatar>
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>{user.firstName?.charAt(0) ?? user.username?.charAt(0) ?? 'U'}</AvatarFallback>
              </Avatar>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink asChild>
              <Link href="/" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                <HomeIcon className="w-4 h-4" />Home
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/history" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                <HistoryIcon className="w-4 h-4" />History
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/game" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                <GamepadIcon className="w-4 h-4" />Game
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="https://www.teepublic.com/user/badboyspodcast" target="_blank" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                <ShirtIcon className="w-4 h-4" />Merch
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink asChild>
              <Link href="/about" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                <UserIcon className="w-4 h-4" />About
              </Link>
            </NavigationMenuLink>
            {isSignedIn ? (<>
              <NavigationMenuLink asChild>
                <Link href="/syllabus" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                  <BookOpenIcon className="w-4 h-4" />Syllabus
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <Link href="/profile" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                  <UserIcon className="w-4 h-4" />Profile
                </Link>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <button 
                  onClick={() => signOut(() => router.push("/"))}
                  className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />Logout
                </button>
              </NavigationMenuLink>
            </>
            ) : (
              <NavigationMenuLink asChild>
                <Link href="/sign-in" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
                  <LogIn className="w-4 h-4" />Login
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

export default NavMenu;
