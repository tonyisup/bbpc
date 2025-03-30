'use client'

import NavMenu from "@/components/NavMenu";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function LayoutMain({
  children,
}: {
  children: React.ReactNode;
}) {
  return (<SidebarProvider>
        <NavMenu />
        <SidebarTrigger />   
        {children}
      </SidebarProvider>
  );
}


