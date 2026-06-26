'use client'

import type { FC } from "react";
import Link from "next/link";
import { HomeIcon, HistoryIcon, TrophyIcon, GamepadIcon, UserIcon, ShirtIcon, LogIn, LogOut, BookOpenIcon, Tag, CalendarIcon } from "lucide-react";
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuTrigger,
	NavigationMenuContent
} from "@/components/ui/navigation-menu";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImpersonationSelector } from "./ImpersonationSelector";
import { cn } from "@/lib/utils";

interface NavItem {
	href: string;
	label: string;
	icon: React.ReactNode;
	requiresAuth?: boolean;
	external?: boolean;
}

const publicNavItems: NavItem[] = [
	{ href: "/", label: "Home", icon: <HomeIcon className="w-4 h-4" /> },
	{ href: "/history", label: "History", icon: <HistoryIcon className="w-4 h-4" /> },
	{ href: "/game", label: "Game", icon: <GamepadIcon className="w-4 h-4" /> },
	{ href: "/tags", label: "Tags", icon: <Tag className="w-4 h-4" /> },
	{ href: "/year", label: "Year", icon: <CalendarIcon className="w-4 h-4" /> },
	{ href: "https://www.teepublic.com/user/badboyspodcast", label: "Merch", icon: <ShirtIcon className="w-4 h-4" />, external: true },
	{ href: "/about", label: "About", icon: <UserIcon className="w-4 h-4" /> },
];

const authNavItems: NavItem[] = [
	{ href: "/syllabus", label: "Syllabus", icon: <BookOpenIcon className="w-4 h-4" />, requiresAuth: true },
	{ href: "/profile", label: "Profile", icon: <UserIcon className="w-4 h-4" />, requiresAuth: true },
];

const NavMenu: FC = () => {
	const { data: session } = useSession();
	const isLoggedIn = !!session?.user;

	const desktopItems = [
		...publicNavItems,
		...authNavItems.filter(item => !item.requiresAuth || isLoggedIn),
	];

	return (
		<div className="flex items-center gap-2">
			<ImpersonationSelector />

			{/* Desktop horizontal nav */}
			<nav className="hidden md:flex items-center gap-1 flex-wrap justify-center" aria-label="Main navigation">
				{desktopItems.map((item) => (
					<Link
						key={item.label}
						href={item.href}
						target={item.external ? "_blank" : undefined}
						rel={item.external ? "noreferrer noopener" : undefined}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-red-400 rounded-md hover:bg-white/5"
					>
						{item.icon}
						<span>{item.label}</span>
					</Link>
				))}
				{isLoggedIn ? (
					<button
						onClick={() => signOut({ callbackUrl: window.location.pathname })}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-red-400 rounded-md hover:bg-white/5"
					>
						<LogOut className="w-4 h-4" />
						<span>Logout</span>
					</button>
				) : (
					<Link
						href="/api/auth/signin"
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:text-red-400 rounded-md hover:bg-white/5"
					>
						<LogIn className="w-4 h-4" />
						<span>Login</span>
					</Link>
				)}
			</nav>

			{/* Mobile dropdown nav */}
			<div className="md:hidden">
				<NavigationMenu orientation="vertical" delayDuration={0}>
					<NavigationMenuList>
						<NavigationMenuItem>
							<NavigationMenuTrigger>
								{session?.user ? (
									<Avatar>
										<AvatarImage src={session.user.image} />
										<AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
									</Avatar>
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-label="Menu" role="img">
										<title>Menu</title>
										<line x1="3" y1="12" x2="21" y2="12"></line>
										<line x1="3" y1="6" x2="21" y2="6"></line>
										<line x1="3" y1="18" x2="21" y2="18"></line>
									</svg>
								)}
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								{publicNavItems.map((item) => (
									<NavigationMenuLink key={item.label} asChild>
										<Link
											href={item.href}
											target={item.external ? "_blank" : undefined}
											rel={item.external ? "noreferrer noopener" : undefined}
											className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400"
										>
											{item.icon}
											{item.label}
										</Link>
									</NavigationMenuLink>
								))}
								{authNavItems.filter(item => !item.requiresAuth || isLoggedIn).map((item) => (
									<NavigationMenuLink key={item.label} asChild>
										<Link href={item.href} className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
											{item.icon}
											{item.label}
										</Link>
									</NavigationMenuLink>
								))}
								{isLoggedIn ? (
									<NavigationMenuLink asChild>
										<button
											onClick={() => signOut({ callbackUrl: window.location.pathname })}
											className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400 w-full text-left"
										>
											<LogOut className="w-4 h-4" />
											Logout
										</button>
									</NavigationMenuLink>
								) : (
									<NavigationMenuLink asChild>
										<Link href="/api/auth/signin" className="flex items-center gap-2 px-4 py-2 transition hover:text-red-400">
											<LogIn className="w-4 h-4" />
											Login
										</Link>
									</NavigationMenuLink>
								)}
							</NavigationMenuContent>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</div>
	);
}

export default NavMenu;
