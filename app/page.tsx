"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList, ShoppingBag, Store } from "lucide-react";

export default function Home() {
  const [totalMenus, setTotalMenus] = useState<number>(0);
  const [totalVendors, setTotalVendors] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);

  useEffect(() => {
    async function fetchHomeStats() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

        const vendorsRes = await fetch(`${baseUrl}/api/vendors`);
        const categoriesRes = await fetch(`${baseUrl}/api/menu-categories`);

        const vendorsData = await vendorsRes.json();
        const categoriesData = await categoriesRes.json();

        const vendors = Array.isArray(vendorsData)
          ? vendorsData
          : vendorsData.data || vendorsData.vendors || [];

        const categories = Array.isArray(categoriesData)
          ? categoriesData
          : categoriesData.data || categoriesData.categories || [];

        setTotalVendors(vendors.length);
        setTotalCategories(categories.length);

        const menuCounts = await Promise.all(
          vendors.map(async (vendor: any) => {
            if (typeof vendor.menuCount === "number") return vendor.menuCount;
            if (typeof vendor.totalMenus === "number") return vendor.totalMenus;
            if (typeof vendor._count?.menus === "number") {
              return vendor._count.menus;
            }

            if (!vendor.id) return 0;

            try {
              const menusRes = await fetch(
                `${baseUrl}/api/vendors/${vendor.id}/menus`
              );

              const menusData = await menusRes.json();

              const menus = Array.isArray(menusData)
                ? menusData
                : menusData.data || menusData.menus || [];

              return menus.length;
            } catch {
              return 0;
            }
          })
        );

        const totalMenuCount = menuCounts.reduce(
          (total: number, count: number) => total + count,
          0
        );

        setTotalMenus(totalMenuCount);
      } catch (error) {
        console.error("FETCH HOME STATS ERROR:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchHomeStats();
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7f7] text-gray-900">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-[#7f1d1d]/10 bg-[#fff7f7]/90 px-6 py-4 backdrop-blur-xl md:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#991b1b] to-[#450a0a] text-xl font-black text-white">
              K
            </div>

            <div>
              <h1 className="text-xl font-black text-[#7f1d1d]">
                KantinKlik
              </h1>
              <p className="text-xs text-gray-500">Kantin sekolah digital</p>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-20 md:px-16 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex rounded-full border border-[#7f1d1d]/20 bg-white px-5 py-2 text-sm font-bold text-[#7f1d1d]">
              Website Pemesanan Makanan Kantin
            </div>

            <h2 className="text-5xl font-black leading-tight text-gray-950 md:text-7xl">
              Pesan makanan kantin jadi{" "}
              <span className="bg-gradient-to-r from-[#991b1b] to-[#450a0a] bg-clip-text text-transparent">
                lebih mudah.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              KantinKlik membantu customer memesan makanan, vendor mengelola
              menu, dan admin mengatur data kantin dalam satu sistem.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#450a0a] px-10 py-4 font-bold text-white shadow-xl shadow-red-900/20 transition hover:scale-105"
              >
                Mulai Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#tentang"
                className="rounded-full border border-[#7f1d1d]/30 bg-white px-10 py-4 text-center font-bold text-[#7f1d1d] hover:bg-red-50"
              >
                Tentang KantinKlik
              </a>
            </div>
          </div>

          {/* CARD DATA REAL */}
          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-[#7f1d1d]/20 blur-2xl" />

            <div className="relative rounded-[2rem] bg-white p-6 shadow-2xl shadow-red-900/10">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-100">Data KantinKlik</p>
                    <h3 className="mt-1 text-2xl font-black">
                      KantinKlik Panel
                    </h3>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-3">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-white/15 p-4">
                    <p className="text-2xl font-black">
                      {loadingStats ? "..." : totalMenus}
                    </p>
                    <p className="text-xs text-red-100">Menu</p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-4">
                    <p className="text-2xl font-black">
                      {loadingStats ? "..." : totalVendors}
                    </p>
                    <p className="text-xs text-red-100">Vendor</p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-4">
                    <p className="text-2xl font-black">
                      {loadingStats ? "..." : totalCategories}
                    </p>
                    <p className="text-xs text-red-100">Kategori</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#7f1d1d]/10 p-3 text-[#7f1d1d]">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Data menu real-time</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                    Aktif
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-[#7f1d1d]/10 p-3 text-[#7f1d1d]">
                      <Store className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold">Vendor aktif tersedia</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-[#7f1d1d]">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENTANG */}
      <section id="tentang" className="bg-white px-6 py-20 text-center md:px-16">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#7f1d1d]">
          Tentang
        </p>

        <h2 className="mt-4 text-4xl font-black text-gray-950">
          Satu website untuk kantin sekolah
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600">
          Customer bisa melihat menu, vendor bisa mengelola makanan, dan admin
          bisa memantau data sistem.
        </p>
      </section>
    </main>
  );
}