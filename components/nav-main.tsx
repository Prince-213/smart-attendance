"use client";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Lineicons from "@lineiconshq/react-lineicons";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Make sure you have this utility

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: any;
  }[];
}) {
  const path = usePathname();
  const router = useRouter();

  // Function to check if a route is active (supports nested routes)
  const isRouteActive = (url: string) => {
    // If it's the root route "/", check for exact match
    if (url === "/") {
      return path === "/";
    }

    // For other routes, check if the current path starts with the item's url
    // This allows highlighting parent routes when child routes are active
    return path === url;
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className=" space-y-5">
          {items.map((item) => {
            const isActive = isRouteActive(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => router.replace(item.url)}
                  
                  
                  tooltip={item.title}
                  className={cn(
                    "flex font-bold items-center gap-3.5 px-4 py-5 text-base rounded-md transition-all duration-200",
                    "hover:bg-blue-100/50 hover:text-blue-700",
                    "active:scale-95",
                    isActive
                      ? "bg-blue-500/10 text-blue-700 border-l-4 border-blue-500 pl-3"
                      : "text-gray-700",
                  )}
                >
                  {item.icon && (
                    <Lineicons
                      icon={item.icon}
                      size={28} // Increased from 24 to 28
                      className={cn(
                        "transition-colors !w-6 !h-6 duration-200",
                        isActive
                          ? "text-blue-600"
                          : "text-gray-600 group-hover:text-blue-600",
                      )}
                      strokeWidth={isActive ? 2 : 1.8} // Slightly thicker when active
                    />
                  )}
                  <span className="font-semibold" >{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
