"use client";

import { FormEvent, useEffect, useState } from "react";
import { Camera, Mail, Phone, Save, Store } from "lucide-react";

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

  async function fetchProfile() {
    try {
      setLoading(true);

      const token = getCookie("accessToken");

      const res = await fetch(`${BASE_API_URL}/api/vendor/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("VENDOR PROFILE:", data);

      if (!res.ok) {
        alert(data.message || "Gagal mengambil profil vendor");
        return;
      }

      const profile = data.data;

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

      const token = getCookie("accessToken");

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

      const token = getCookie("accessToken");

      const formData = new FormData();

      // Backend kamu tidak menerima field "logo".
      // Jadi field upload-nya diganti menjadi "file".
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
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <section className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Store size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Profil Vendor
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Kelola informasi kantin dan logo vendor kamu.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm">
            Mengambil data profil...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LOGO CARD */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-gray-800">
                Logo Vendor
              </h2>

              <div className="flex flex-col items-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border bg-gray-50">
                  {vendor?.logoUrl ? (
                    <img
                      src={vendor.logoUrl}
                      alt="Logo Vendor"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera size={42} className="text-gray-400" />
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setLogoFile(e.target.files?.[0] || null);
                  }}
                  className="mt-5 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                />

                {logoFile && (
                  <p className="mt-2 text-xs text-gray-500">
                    File dipilih: {logoFile.name}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleUploadLogo}
                  disabled={uploading}
                  className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Mengupload..." : "Upload Logo"}
                </button>
              </div>
            </div>

            {/* FORM PROFILE */}
            <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="mb-5 text-lg font-bold text-gray-800">
                Informasi Vendor
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Nama Kantin
                  </label>

                  <input
                    type="text"
                    value={canteenName}
                    onChange={(e) => setCanteenName(e.target.value)}
                    placeholder="Contoh: Pak Yoyok"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Deskripsi
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Menjual makanan dan minuman sekolah."
                    rows={4}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Mail size={17} />
                      Email
                    </div>

                    <p className="text-sm text-gray-600">
                      {vendor?.user?.email || "-"}
                    </p>
                  </div>

                  <div className="rounded-xl border bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Phone size={17} />
                      WhatsApp
                    </div>

                    <p className="text-sm text-gray-600">
                      {vendor?.user?.whatsappNumber || "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Nomor Kantin
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    {vendor?.canteenNumber || "-"}
                  </p>
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Status Vendor
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      vendor?.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {vendor?.isActive ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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