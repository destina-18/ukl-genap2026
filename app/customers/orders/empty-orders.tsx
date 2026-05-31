"use client";

import Link from "next/link";
import { ClipboardList, Utensils } from "lucide-react";

export default function EmptyOrders() {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-[#7f1d1d]/20 bg-white p-10 text-center shadow-lg shadow-red-900/5">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
        <ClipboardList className="h-10 w-10" />
      </div>

      <h2 className="text-2xl font-black text-gray-950">
        Belum ada pesanan
      </h2>

      <p className="mt-3 text-sm leading-6 text-gray-500">
        Kamu belum melakukan checkout. Pilih menu dulu untuk membuat pesanan.
      </p>

      <Link
        href="/customers/menu"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b]"
      >
        <Utensils className="h-4 w-4" />
        Lihat Menu
      </Link>
    </section>
  );
}