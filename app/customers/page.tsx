"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customers/dashboard");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7f7]">
      <p className="text-sm font-bold text-[#7f1d1d]">
        Mengarahkan ke dashboard...
      </p>
    </main>
  );
}