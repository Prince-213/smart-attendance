import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Home2Outlined,
  User4Duotone,
  DashboardSquare1Bulk,
  Book1Bulk,
  HourglassBulk,
} from "@lineiconshq/free-icons";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const staffLinks = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: DashboardSquare1Bulk,
    },

    {
      title: "Records",
      url: "/dashboard/records",
      icon: Book1Bulk,
    },

    {
      title: "History",
      url: "/dashboard/history",
      icon: HourglassBulk,
    },
  ],

  navSecondary: [
    {
      title: "Profile",
      url: "/staff/dashboard/profile",
      icon: User4Duotone,
    },
  ],
};

export const adminLinks = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home2Outlined,
    },

    {
      title: "Records",
      url: "/staff/dashboard/records",
      icon: Book1Bulk,
    },
  ],

  navSecondary: [
    {
      title: "Branches",
      url: "/admin/dashboard/branches ",
      icon: User4Duotone,
    },

    /* {
      title: "Search",
      url: "#",
      icon: IconSearch,
    }, */
  ],
};

export const databaseUrl = "http://localhost:4000";
