"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList,
  Utensils,
  User,
  ShieldCheck,
} from "lucide-react";

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
    url: "/customers/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Menu",
    url: "/customers/menu",
    icon: Utensils,
  },
  {
    title: "Keranjang",
    url: "/customers/cart",
    icon: ShoppingCart,
  },
  {
    title: "Pesanan",
    url: "/customers/orders",
    icon: ClipboardList,
  },
  {
    title: "Profile",
    url: "/customers/profile",
    icon: User,
  },
];

export function AppCustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function deleteCookie(name: string) {
    document.cookie = `${name}=; path=/; max-age=0`;
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }

  function handleLogout() {
    // hapus localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accesstoken");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    // hapus sessionStorage
    sessionStorage.clear();

    // hapus cookie
    deleteCookie("accessToken");
    deleteCookie("accesstoken");
    deleteCookie("token");
    deleteCookie("role");

    // arahkan ke sign-in
    router.replace("/sign-in");

    // paksa refresh biar state lama hilang
    setTimeout(() => {
      window.location.href = "/sign-in";
    }, 100);
  }

  return (
    <Sidebar className="border-r border-[#7f1d1d]/10 bg-[#fff7f7]">
      <SidebarHeader className="border-b border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-5">
        <div className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-4 text-white shadow-lg shadow-red-900/20">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#7f1d1d] shadow-md">
              K
            </div>

            <div>
              <h1 className="text-lg font-black leading-none">KantinKlik</h1>
              <p className="mt-1 text-xs font-medium text-red-100">
                Customer Panel
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-2 text-xs font-bold text-red-50 backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Pesan makanan kantin
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#fff7f7] px-3 py-5">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.url || pathname.startsWith(`${item.url}/`);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className={`h-12 rounded-2xl px-4 font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#991b1b] to-[#450a0a] text-white shadow-lg shadow-red-900/20 hover:text-white"
                      : "text-gray-600 hover:bg-white hover:text-[#7f1d1d] hover:shadow-md"
                  }`}
                >
                  <Link href={item.url} className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${
                        isActive ? "text-white" : "text-[#7f1d1d]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#7f1d1d]/10 bg-[#fff7f7] p-3">
        <div className="mb-3 rounded-2xl border border-[#7f1d1d]/10 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-[#7f1d1d]">
            Customer Mode
          </p>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            Login sebagai customer untuk melihat menu, keranjang, dan pesanan.
          </p>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="h-12 rounded-2xl px-4 font-bold text-[#7f1d1d] transition hover:bg-red-100 hover:text-[#450a0a]"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}