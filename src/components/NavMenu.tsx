'use client'

import type { FC } from "react";
import Link from "next/link";
import { Auth } from "@/components/Auth";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { HomeIcon, HistoryIcon, TrophyIcon, GamepadIcon, UserIcon } from "lucide-react";
const NavMenu: FC = () => {
  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <HomeIcon className="w-4 h-4" />
                  <Link className="transition hover:text-red-400" href="/">Home</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <HistoryIcon className="w-4 h-4" />
                  <Link className="transition hover:text-red-400" href="/history">History</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <TrophyIcon className="w-4 h-4" />
                  <Link className="transition hover:text-red-400" href="/points">Points</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <GamepadIcon className="w-4 h-4" size="lg" />
                  <Link className="transition hover:text-red-400" href="/game">Game</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <UserIcon className="w-4 h-4" />
                  <Auth />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default NavMenu;