"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-template/app-sidebar";

export default function AdminLayout({
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

    if (!token || role !== "ADMIN") {
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
      <div className="flex min-h-screen w-full bg-[#fff7f7]">
        <AppSidebar />

        <main className="flex-1">
          <div className="border-b border-[#7f1d1d]/10 bg-white px-4 py-3">
            <SidebarTrigger />
          </div>

          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}