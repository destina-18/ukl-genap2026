"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  RefreshCcw,
  ShieldCheck,
  User,
  LogOut,
} from "lucide-react";

type CustomerProfile = {
  id?: number | string;
  name?: string;
  email?: string;
  whatsappNumber?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
  isVerified?: boolean;
  verified?: boolean;
  [key: string]: any;
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

function formatDate(dateString?: string) {
  if (!dateString) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString));
}

function getProfileFromResponse(response: any) {
  return (
    response?.data?.user ||
    response?.data?.customer ||
    response?.data ||
    response?.user ||
    response?.customer ||
    response
  );
}

export default function CustomersProfilePage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
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

  async function getProfile() {
    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          setProfile(JSON.parse(savedUser));
        } catch (error) {
          console.log("Gagal membaca user dari localStorage:", error);
        }
      }

      const response = await fetch(`${BASE_API_URL}/api/customers/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);
      console.log("CUSTOMER PROFILE RESPONSE:", data);

      if (!response.ok) {
        console.log("Gagal ambil profile dari BE:", data);
        return;
      }

      const profileData = getProfileFromResponse(data);
      setProfile(profileData);

      if (profileData) {
        localStorage.setItem("user", JSON.stringify(profileData));
      }
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProfile();
  }, []);

  const verified = profile?.isVerified || profile?.verified;

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto max-w-5xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/customers/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Link>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Profile Customer
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Lihat informasi akun customer yang sedang login di KantinKlik.
              </p>
            </div>

            <button
              onClick={getProfile}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </section>

        {loading ? (
          <section className="flex min-h-[300px] items-center justify-center rounded-[1.5rem] bg-white shadow-lg shadow-red-900/5">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />
              <p className="text-sm font-bold text-[#7f1d1d]">
                Memuat profile...
              </p>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
            <aside className="h-fit rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 text-center shadow-lg shadow-red-900/5">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <User className="h-12 w-12" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-gray-950">
                {profile?.name || "Customer"}
              </h2>

              <p className="mt-2 text-sm font-semibold text-gray-500">
                {profile?.email || "-"}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-sm font-black text-[#7f1d1d]">
                <ShieldCheck className="h-4 w-4" />
                {profile?.role || "CUSTOMER"}
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-4 text-sm font-black text-red-700 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </aside>

            <section className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-950">
                  Informasi Akun
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Data ini diambil dari akun yang sedang login.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                      <User className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-500">Nama</p>
                      <p className="mt-1 text-lg font-black text-gray-950">
                        {profile?.name || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                      <Mail className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-500">Email</p>
                      <p className="mt-1 break-all text-lg font-black text-gray-950">
                        {profile?.email || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                      <Phone className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-500">
                        No WhatsApp
                      </p>
                      <p className="mt-1 text-lg font-black text-gray-950">
                        {profile?.whatsappNumber || profile?.phone || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                      <ShieldCheck className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-500">
                        Status Verifikasi
                      </p>
                      <p
                        className={`mt-1 text-lg font-black ${
                          verified ? "text-green-700" : "text-yellow-700"
                        }`}
                      >
                        {verified ? "Terverifikasi" : "Belum diketahui"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <p className="text-sm font-bold text-gray-500">
                    Tanggal Daftar
                  </p>
                  <p className="mt-1 text-lg font-black text-gray-950">
                    {formatDate(profile?.createdAt)}
                  </p>
                </div>
              </div>
            </section>
          </section>
        )}
      </div>
    </main>
  );
}