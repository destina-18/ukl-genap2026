"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  LogOut,
  ShoppingCart,
  Store,
  User,
  Utensils,
} from "lucide-react";

type UserData = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

export default function CustomersDashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  function handleLogout() {
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "accesstoken=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";

    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.location.href = "/sign-in";
  }

  useEffect(() => {
    const token =
      getCookie("accessToken") || localStorage.getItem("accessToken");

    if (!token) {
      window.location.href = "/sign-in";
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.log("Gagal membaca data user:", error);
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7f7] px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white px-6 py-6 text-center shadow-xl shadow-red-900/10 sm:px-8">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />
          <p className="text-sm font-bold text-gray-600">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff7f7] px-3 py-4 text-gray-900 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* HERO */}
        <section className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-5 text-white shadow-2xl shadow-red-900/20 sm:p-7 lg:mb-8 lg:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-red-50 backdrop-blur sm:mb-5 sm:text-sm">
                <User className="h-4 w-4 shrink-0" />
                <span className="truncate">Customer Dashboard</span>
              </div>

              <h1 className="break-words text-2xl font-black leading-tight tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
                Halo, {user?.name || "Customer"}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 sm:text-base">
                Selamat datang di KantinKlik. Kamu bisa melihat menu kantin,
                memasukkan makanan ke keranjang, dan mengecek pesananmu.
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-[1.02] sm:w-fit"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Logout
            </button>
          </div>
        </section>

        {/* PROFILE CARD */}
        <section className="mb-5 rounded-3xl border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 sm:p-6 lg:mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d] sm:h-16 sm:w-16">
                <User className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              <div className="min-w-0">
                <h2 className="break-words text-lg font-black text-gray-950 sm:text-xl">
                  {user?.name || "Nama Customer"}
                </h2>

                <p className="mt-1 break-all text-sm font-semibold text-gray-500">
                  {user?.email || "Email customer"}
                </p>
              </div>
            </div>

            <div className="w-fit rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-sm font-black text-[#7f1d1d]">
              {user?.role || "CUSTOMER"}
            </div>
          </div>
        </section>

        {/* MENU CARDS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <DashboardCard
            href="/customers/menu"
            icon={<Utensils className="h-7 w-7" />}
            title="Lihat Menu"
            description="Pilih makanan dan minuman yang tersedia dari vendor kantin."
          />

          <DashboardCard
            href="/customers/cart"
            icon={<ShoppingCart className="h-7 w-7" />}
            title="Keranjang"
            description="Cek makanan yang sudah kamu pilih sebelum checkout."
          />

          <DashboardCard
            href="/customers/orders"
            icon={<ClipboardList className="h-7 w-7" />}
            title="Pesanan"
            description="Lihat riwayat dan status pesanan makanan kamu."
          />
        </section>

        {/* CTA */}
        <section className="mt-5 rounded-3xl border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 sm:p-6 lg:mt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <Store className="h-6 w-6" />
              </div>

              <h3 className="break-words text-lg font-black text-gray-950 sm:text-xl">
                Pesan makanan kantin jadi lebih mudah
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Pilih menu, masukkan ke keranjang, lalu checkout. Dashboard ini
                khusus untuk customer yang sudah login dan terverifikasi.
              </p>
            </div>

            <Link
              href="/customers/menu"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b] sm:w-fit"
            >
              Mulai Pesan
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
        {icon}
      </div>

      <div className="flex min-w-0 items-center justify-between gap-4">
        <h3 className="break-words text-base font-black text-gray-950 sm:text-lg">
          {title}
        </h3>

        <ArrowRight className="h-5 w-5 shrink-0 text-[#7f1d1d] transition group-hover:translate-x-1" />
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-500">{description}</p>
    </Link>
  );
}