"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";

import EditProfile, { type CustomerProfile } from "./edit-profile";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function getProfileFromResponse(response: any) {
  return (
    response?.data?.user ||
    response?.data?.profile ||
    response?.data ||
    response?.user ||
    response?.profile ||
    response
  );
}

export default function CustomerProfilePage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

      const response = await fetch(`${BASE_API_URL}/api/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      console.log("PROFILE RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal mengambil profile");
        return;
      }

      const profileData = getProfileFromResponse(data);
      setProfile(profileData);
    } catch (error) {
      console.error("GET PROFILE ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");

    window.location.href = "/sign-in";
  }

  useEffect(() => {
    getProfile();
  }, []);

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
                Profile Saya
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Lihat dan edit data akun customer kamu sendiri.
              </p>
            </div>

            {profile && (
              <EditProfile
                profile={profile}
                baseApiUrl={BASE_API_URL}
                onSuccess={getProfile}
              />
            )}
          </div>
        </section>

        {loading ? (
          <section className="flex min-h-[350px] items-center justify-center rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-lg shadow-red-900/5">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#7f1d1d]" />
              <p className="text-sm font-black text-[#7f1d1d]">
                Memuat profile...
              </p>
            </div>
          </section>
        ) : !profile ? (
          <section className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-8 text-center shadow-lg shadow-red-900/5">
            <h2 className="text-xl font-black text-gray-950">
              Profile tidak ditemukan
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Coba login ulang atau refresh halaman.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="h-fit rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 text-center shadow-lg shadow-red-900/5">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[2rem] bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <User className="h-14 w-14" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-gray-950">
                {profile.name || "Customer"}
              </h2>

              <p className="mt-1 text-sm font-semibold text-gray-500">
                {profile.email || "-"}
              </p>

              <div className="mt-5 inline-flex rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-xs font-black text-[#7f1d1d]">
                {profile.role || "CUSTOMER"}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 w-full rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
              >
                Logout
              </button>
            </aside>

            <section className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
              <h2 className="mb-5 text-2xl font-black text-gray-950">
                Detail Profile
              </h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7f1d1d]">
                    <User className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                    Nama
                  </p>

                  <p className="mt-1 text-base font-black text-gray-950">
                    {profile.name || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7f1d1d]">
                    <Mail className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-base font-black text-gray-950">
                    {profile.email || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7f1d1d]">
                    <Phone className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                    WhatsApp
                  </p>

                  <p className="mt-1 text-base font-black text-gray-950">
                    {profile.whatsappNumber || profile.phone || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#7f1d1d]">
                    <Shield className="h-5 w-5" />
                  </div>

                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                    Role
                  </p>

                  <p className="mt-1 text-base font-black text-gray-950">
                    {profile.role || "CUSTOMER"}
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