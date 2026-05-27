import { AppVendorSidebar } from "@/components/vendor-template/app-sidebar"; 
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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