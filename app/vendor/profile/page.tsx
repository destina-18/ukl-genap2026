"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Camera,
  Mail,
  Phone,
  Save,
  Store,
  RefreshCcw,
  BadgeCheck,
  Hash,
} from "lucide-react";

type VendorProfile = {
  id: number;
  userId: number;
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
  };
};

export default function VendorProfilePage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const [vendor, setVendor] = useState<VendorProfile | null>(null);

  const [canteenName, setCanteenName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

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
    return getCookie("accessToken") || getCookie("accesstoken");
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

      const res = await fetch(`${BASE_API_URL}/api/vendor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();
      console.log("VENDOR PROFILE:", data);

      if (!res.ok) {
        alert(data.message || "Gagal mengambil profil vendor");
        return;
      }

      const profile = data.data || data;

      setVendor(profile);
      setCanteenName(profile.canteenName || "");
      setDescription(profile.description || "");
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil profil vendor");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

      const res = await fetch(`${BASE_API_URL}/api/vendor/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          canteenName,
          description,
        }),
      });

      const data = await res.json();
      console.log("UPDATE PROFILE:", data);

      if (!res.ok) {
        alert(data.message || "Gagal memperbarui profil vendor");
        return;
      }

      alert("Profil vendor berhasil diperbarui");
      fetchProfile();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui profil vendor");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadLogo() {
    if (!logoFile) {
      alert("Pilih file logo terlebih dahulu");
      return;
    }

    try {
      setUploading(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const formData = new FormData();
      formData.append("file", logoFile);

      const res = await fetch(`${BASE_API_URL}/api/vendor/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log("UPLOAD LOGO:", data);

      if (!res.ok) {
        alert(data.message || "Gagal upload logo");
        return;
      }

      alert("Logo berhasil diupload");
      setLogoFile(null);
      fetchProfile();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat upload logo");
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[120px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
      </div>

      <section className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Store className="h-4 w-4" />
                Vendor Profile
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Profil Vendor
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Kelola informasi kantin, deskripsi, dan logo vendor agar
                tampilan kantinmu terlihat lebih menarik.
              </p>
            </div>

            <button
              onClick={fetchProfile}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-10 text-center text-sm font-semibold text-gray-500 shadow-xl shadow-red-900/5">
            Mengambil data profil...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LOGO CARD */}
            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-xl shadow-red-900/5">
              <h2 className="mb-2 text-xl font-black text-gray-950">
                Logo Vendor
              </h2>

              <p className="mb-6 text-sm leading-6 text-gray-500">
                Upload logo kantin agar customer lebih mudah mengenali vendormu.
              </p>

              <div className="flex flex-col items-center">
                <div className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-[2rem] border border-[#7f1d1d]/10 bg-[#fff7f7] shadow-inner">
                  {vendor?.logoUrl ? (
                    <img
                      src={vendor.logoUrl}
                      alt="Logo Vendor"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera size={46} className="text-[#7f1d1d]/50" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setLogoFile(e.target.files?.[0] || null);
                  }}
                  className="mt-6 w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-3 py-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#7f1d1d] file:px-4 file:py-1 file:text-sm file:font-bold file:text-white"
                />

                {logoFile && (
                  <p className="mt-3 rounded-full bg-[#fff0f0] px-4 py-2 text-xs font-bold text-[#7f1d1d]">
                    File dipilih: {logoFile.name}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleUploadLogo}
                  disabled={uploading}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera size={18} />
                  {uploading ? "Mengupload..." : "Upload Logo"}
                </button>
              </div>
            </div>

            {/* FORM PROFILE */}
            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-xl shadow-red-900/5 lg:col-span-2">
              <h2 className="mb-2 text-xl font-black text-gray-950">
                Informasi Vendor
              </h2>

              <p className="mb-6 text-sm leading-6 text-gray-500">
                Perbarui nama kantin dan deskripsi agar informasi vendor selalu
                sesuai.
              </p>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-gray-700">
                    Nama Kantin
                  </label>

                  <input
                    type="text"
                    value={canteenName}
                    onChange={(e) => setCanteenName(e.target.value)}
                    placeholder="Contoh: Kantin Pak Yoyok"
                    className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#7f1d1d] focus:bg-white focus:shadow-lg focus:shadow-red-900/5"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-gray-700">
                    Deskripsi
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Menjual makanan dan minuman sekolah."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#7f1d1d] focus:bg-white focus:shadow-lg focus:shadow-red-900/5"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#7f1d1d]">
                      <Mail size={17} />
                      Email
                    </div>

                    <p className="text-sm font-medium text-gray-600">
                      {vendor?.user?.email || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#7f1d1d]">
                      <Phone size={17} />
                      WhatsApp
                    </div>

                    <p className="text-sm font-medium text-gray-600">
                      {vendor?.user?.whatsappNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#7f1d1d]">
                      <Hash size={17} />
                      Nomor Kantin
                    </div>

                    <p className="text-sm font-medium text-gray-600">
                      {vendor?.canteenNumber || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#7f1d1d]">
                      <BadgeCheck size={17} />
                      Status Vendor
                    </div>

                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-black ${
                        vendor?.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-[#7f1d1d]"
                      }`}
                    >
                      {vendor?.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={18} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}