'use client'

import type { FC } from "react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { HomeIcon, HistoryIcon, TrophyIcon, GamepadIcon, UserIcon } from "lucide-react";
const NavMenu: FC = () => {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/">
                    <HomeIcon className="w-4 h-4"/>Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/history">
                    <HistoryIcon className="w-4 h-4"/>History
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/points">
                    <TrophyIcon className="w-4 h-4"/>Points
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/game">
                    <GamepadIcon className="w-4 h-4"/>Game
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/profile">
                    <UserIcon className="w-4 h-4"/>Profile
                  </Link>
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