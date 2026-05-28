"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppCustomerSidebar } from "@/components/customers-template/app-sidebar"; 

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppCustomerSidebar />

      <main className="min-h-screen flex-1 bg-[#fff7f7]">
        <div className="border-b border-[#7f1d1d]/10 bg-white px-4 py-3">
          <SidebarTrigger />
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}