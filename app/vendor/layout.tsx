"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppVendorSidebar } from "@/components/vendor-template/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("accesstoken") ||
      localStorage.getItem("token");

    const role = localStorage.getItem("role");

    if (!token || role !== "VENDOR") {
      router.replace("/sign-in");
      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff7f7]">
        <p className="text-sm font-semibold text-[#7f1d1d]">
          Checking access...
        </p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppVendorSidebar />

        <main className="flex-1 bg-gray-100">
          <div className="sticky top-0 z-10 flex h-14 items-center border-b bg-white px-4 md:hidden">
            <SidebarTrigger />
          </div>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}