"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { adminLinks, staffLinks } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Lineicons from "@lineiconshq/react-lineicons";
import { GraduationCap1Outlined, CodegeexOutlined, DashboardSquare1Outlined } from "@lineiconshq/free-icons";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();

  const sideLinks = staffLinks;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a
              href="https://prebuiltui.com"
              className=" pt-3 px-3 flex items-center space-x-1.5"
            >
              <Lineicons
                icon={CodegeexOutlined}
                size={32}
                color="blue"
                strokeWidth={1.5}
              />
              <h1 className=" font-bold text-xl">Attendly</h1>
            </a>
          </SidebarMenuItem>

          <br />

         
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sideLinks.navMain} />
        <NavSecondary items={sideLinks.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sideLinks.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
