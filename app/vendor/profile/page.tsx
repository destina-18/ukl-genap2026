"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Edit3,
  Hash,
  Mail,
  Phone,
  RefreshCcw,
  Save,
  Shield,
  Store,
  User,
  X,
} from "lucide-react";

type VendorProfile = {
  id?: number;
  userId?: number;
  canteenNumber?: number;
  canteenName?: string;
  description?: string;
  logoUrl?: string | null;
  isActive?: boolean;
  user?: {
    id?: number;
    email?: string;
    name?: string;
    whatsappNumber?: string;
    role?: string;
  };
};

export default function VendorProfilePage() {
  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [openEdit, setOpenEdit] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");

  function getCookie(name: string) {
    if (typeof document === "undefined") return "";

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || "";
    }

    return "";
  }

  function getToken() {
    if (typeof window === "undefined") return "";

    return (
      getCookie("accessToken") ||
      getCookie("accesstoken") ||
      localStorage.getItem("accessToken") ||
      ""
    );
  }

  function getErrorMessage(data: any, fallback: string) {
    if (Array.isArray(data?.message)) return data.message.join(", ");
    return data?.message || fallback;
  }

  function openEditModal() {
    setName(vendor?.user?.name || "");
    setWhatsappNumber(vendor?.user?.whatsappNumber || "");
    setOpenEdit(true);
  }

  async function fetchProfile() {
    try {
      setLoading(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/vendor/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);
      console.log("VENDOR PROFILE RESPONSE:", data);

      if (!response.ok) {
        alert(getErrorMessage(data, "Gagal mengambil profil vendor"));
        return;
      }

      const profile = data?.data || data?.vendor || data?.profile || data;

      setVendor(profile);
      setName(profile?.user?.name || "");
      setWhatsappNumber(profile?.user?.whatsappNumber || "");
    } catch (error) {
      console.error("FETCH VENDOR PROFILE ERROR:", error);
      alert("Terjadi kesalahan saat mengambil profil vendor");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama wajib diisi");
      return;
    }

    if (!whatsappNumber.trim()) {
      alert("Nomor WhatsApp wajib diisi");
      return;
    }

    try {
      setSaving(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      // PENTING:
      // Update nama & nomor WhatsApp pakai endpoint /api/users/me,
      // bukan /api/vendor/profile.
      const response = await fetch(`${BASE_API_URL}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          whatsappNumber: whatsappNumber.trim(),
        }),
      });

      const data = await response.json().catch(() => null);
      console.log("UPDATE USER ME RESPONSE:", data);

      if (!response.ok) {
        alert(getErrorMessage(data, "Gagal memperbarui profil vendor"));
        return;
      }

      alert(data?.message || "Profil berhasil diupdate");
      setOpenEdit(false);
      await fetchProfile();
    } catch (error) {
      console.error("UPDATE USER ME ERROR:", error);
      alert("Terjadi kesalahan saat memperbarui profil vendor");
    } finally {
      setSaving(false);
    }
  }

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
    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <button
                type="button"
                onClick={() => (window.location.href = "/vendor/dashboard")}
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft size={16} />
                Kembali ke Dashboard
              </button>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Profil Vendor
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Lihat dan edit data akun vendormu sendiri.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchProfile}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={openEditModal}
                disabled={loading || !vendor}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-10 text-center text-sm font-semibold text-gray-500 shadow-xl shadow-red-900/5">
            Mengambil data profil...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 text-center shadow-xl shadow-red-900/5">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] bg-[#fff7f7] text-[#7f1d1d]">
                {vendor?.logoUrl ? (
                  <img
                    src={vendor.logoUrl}
                    alt="Logo Vendor"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={54} />
                )}
              </div>

              <h2 className="mt-6 break-words text-2xl font-black text-gray-950">
                {vendor?.user?.name || "-"}
              </h2>

              <p className="mt-2 break-words text-sm font-semibold leading-6 text-gray-500">
                {vendor?.user?.email || "-"}
              </p>

              <div className="mt-5 inline-flex rounded-full bg-[#fff0f0] px-5 py-2 text-xs font-black text-[#7f1d1d]">
                VENDOR
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-8 w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-4 text-sm font-black text-[#7f1d1d] transition hover:bg-[#7f1d1d] hover:text-white"
              >
                Logout
              </button>
            </div>

            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-xl shadow-red-900/5 lg:col-span-2">
              <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-950">
                    Detail Profile
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Informasi akun vendor yang sedang login.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openEditModal}
                  className="inline-flex w-fit items-center justify-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#991b1b]"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoCard
                  icon={<User size={20} />}
                  label="Nama"
                  value={vendor?.user?.name || "-"}
                />

                <InfoCard
                  icon={<Mail size={20} />}
                  label="Email"
                  value={vendor?.user?.email || "-"}
                />

                <InfoCard
                  icon={<Phone size={20} />}
                  label="WhatsApp"
                  value={vendor?.user?.whatsappNumber || "-"}
                />

                <InfoCard
                  icon={<Shield size={20} />}
                  label="Role"
                  value="VENDOR"
                />

                <InfoCard
                  icon={<Store size={20} />}
                  label="Nama Kantin"
                  value={vendor?.canteenName || "-"}
                />

                <InfoCard
                  icon={<Hash size={20} />}
                  label="Nomor Kantin"
                  value={
                    vendor?.canteenNumber ? String(vendor.canteenNumber) : "-"
                  }
                />

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5 md:col-span-2">
                  <div className="mb-3 flex items-center gap-3 text-[#7f1d1d]">
                    <div className="rounded-2xl bg-white p-3">
                      <BadgeCheck size={20} />
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                        Status Vendor
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-black ${
                          vendor?.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-[#7f1d1d]"
                        }`}
                      >
                        {vendor?.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5 md:col-span-2">
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-gray-400">
                    Deskripsi Kantin
                  </p>

                  <p className="whitespace-pre-wrap break-words text-sm font-semibold leading-7 text-gray-700">
                    {vendor?.description || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-gray-950">
                  Edit Profile
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Vendor hanya bisa mengubah nama dan nomor WhatsApp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpenEdit(false)}
                className="rounded-2xl bg-[#fff7f7] p-4 text-[#7f1d1d] transition hover:bg-[#7f1d1d] hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Nama
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama vendor"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-5 py-4 text-sm font-bold outline-none transition focus:border-[#7f1d1d] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Nomor WhatsApp
                </label>

                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) =>
                    setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Contoh: 085xxxxxxxxx"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-5 py-4 text-sm font-bold outline-none transition focus:border-[#7f1d1d] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Email
                </label>

                <input
                  type="text"
                  value={vendor?.user?.email || "-"}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 text-sm font-bold text-gray-500 outline-none"
                />

                <p className="mt-2 text-xs font-semibold text-gray-400">
                  Email tidak bisa diubah dari sini.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Role
                </label>

                <input
                  type="text"
                  value="VENDOR"
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 text-sm font-bold text-gray-500 outline-none"
                />

                <p className="mt-2 text-xs font-semibold text-gray-400">
                  Role tidak boleh diedit.
                </p>
              </div>

              <div className="grid gap-4 pt-4 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  disabled={saving}
                  className="rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-4 text-sm font-black text-[#7f1d1d] transition hover:bg-[#7f1d1d]/5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={18} />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
      <div className="mb-3 flex items-center gap-3 text-[#7f1d1d]">
        <div className="rounded-2xl bg-white p-3">{icon}</div>
      </div>

      <p className="text-xs font-black uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-black leading-6 text-gray-900">
        {value}
      </p>
    </div>
  );
}