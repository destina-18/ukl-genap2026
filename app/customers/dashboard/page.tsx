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
      <main className="flex min-h-screen items-center justify-center bg-[#fff7f7]">
        <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-xl shadow-red-900/10">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />
          <p className="text-sm font-bold text-gray-600">
            Memuat dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <User className="h-4 w-4" />
                Customer Dashboard
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Halo, {user?.name || "Customer"}!
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Selamat datang di KantinKlik. Kamu bisa melihat menu kantin,
                memasukkan makanan ke keranjang, dan mengecek pesananmu.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <User className="h-8 w-8" />
              </div>

              <div>
                <h2 className="text-xl font-black text-gray-950">
                  {user?.name || "Nama Customer"}
                </h2>

                <p className="mt-1 text-sm font-semibold text-gray-500">
                  {user?.email || "Email customer"}
                </p>
              </div>
            </div>

            <div className="w-fit rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-sm font-black text-[#7f1d1d]">
              {user?.role || "CUSTOMER"}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Link
            href="/customers/menu"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Utensils className="h-7 w-7" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-black text-gray-950">Lihat Menu</h3>
              <ArrowRight className="h-5 w-5 text-[#7f1d1d] transition group-hover:translate-x-1" />
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Pilih makanan dan minuman yang tersedia dari vendor kantin.
            </p>
          </Link>

          <Link
            href="/customers/cart"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <ShoppingCart className="h-7 w-7" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-black text-gray-950">Keranjang</h3>
              <ArrowRight className="h-5 w-5 text-[#7f1d1d] transition group-hover:translate-x-1" />
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Cek makanan yang sudah kamu pilih sebelum checkout.
            </p>
          </Link>

          <Link
            href="/customers/orders"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <ClipboardList className="h-7 w-7" />
            </div>

            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-black text-gray-950">Pesanan</h3>
              <ArrowRight className="h-5 w-5 text-[#7f1d1d] transition group-hover:translate-x-1" />
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Lihat riwayat dan status pesanan makanan kamu.
            </p>
          </Link>
        </section>

        <section className="mt-8 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <Store className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-black text-gray-950">
                Pesan makanan kantin jadi lebih mudah
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Pilih menu, masukkan ke keranjang, lalu checkout. Dashboard ini
                khusus untuk customer yang sudah login dan terverifikasi.
              </p>
            </div>

            <Link
              href="/customers/menu"
              className="flex w-fit items-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b]"
            >
              Mulai Pesan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}