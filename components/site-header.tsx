"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "./ui/badge";
import { usePathname } from "next/navigation";
import { adminLinks, staffLinks } from "@/lib/utils";
import { Users2 } from "lucide-react";

export function SiteHeader() {
  const path = usePathname();

  const title = path.includes("admin")
    ? adminLinks.navMain.find((item) => item.url == path)?.title
    : staffLinks.navMain.find((item) => item.url == path)?.title;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-500 border border-gray-200 rounded-full px-4 py-2">
            <div className="relative flex size-3.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping duration-300"></span>
              <span className="relative inline-flex size-2 rounded-full bg-green-600"></span>
            </div>
            <span className=" text-sm">Attendance active</span>
          </div>

          {/*   <div className="flex items-center space-x-2.5 border border-gray-200 rounded-full bg-gray-100/50 p-1 text-sm text-gray-800">
            <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-2xl px-3 py-1">
              <Users2 size={16} />
              <p>No. of completed classes</p>
            </div>
            <p className="pr-3 font-semibold">10 classes</p>
          </div> */}
        </div>
      </div>
    </header>
  );
}
