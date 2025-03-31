'use client'

import type { FC } from "react";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent, useSidebar } from "@/components/ui/sidebar";
import { HomeIcon, HistoryIcon, TrophyIcon, GamepadIcon, UserIcon } from "lucide-react";

const NavMenu: FC = () => {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/" onClick={() => setOpenMobile(false)}>
                    <HomeIcon className="w-4 h-4"/>Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/history" onClick={() => setOpenMobile(false)}>
                    <HistoryIcon className="w-4 h-4"/>History
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/points" onClick={() => setOpenMobile(false)}>
                    <TrophyIcon className="w-4 h-4"/>Points
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/game" onClick={() => setOpenMobile(false)}>
                    <GamepadIcon className="w-4 h-4"/>Game
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Link className="transition hover:text-red-400 flex items-center gap-2" href="/profile" onClick={() => setOpenMobile(false)}>
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