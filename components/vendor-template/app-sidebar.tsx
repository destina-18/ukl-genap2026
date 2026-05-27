"use client";

import Link from "next/link";
import { LayoutDashboard, Store, LogOut, Utensils } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/vendor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profil Vendor",
    url: "/vendor/profile",
    icon: Store,
  },
  {
    title: "Menu Makanan",
    url: "/vendor/menus",
    icon: Utensils,
  },
];

export function AppVendorSidebar() {
  function handleLogout() {
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    window.location.href = "/sign-in";
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-3 py-2">
          <h1 className="text-lg font-bold text-red-700">KantinKlik</h1>
          <p className="text-xs text-muted-foreground">Vendor Panel</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}