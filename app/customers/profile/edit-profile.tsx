"use client";

import { FormEvent, useEffect, useState } from "react";
import { X, Pencil, Loader2 } from "lucide-react";

export type CustomerProfile = {
  id?: number | string;
  name?: string;
  email?: string;
  whatsappNumber?: string;
  phone?: string;
  role?: string;
  fullAddress?: string;
  address?: string;
  addressDetail?: string;
  city?: {
    name?: string;
    province?: {
      name?: string;
    };
  };
  province?: {
    name?: string;
  };
  [key: string]: any;
};

type EditProfileProps = {
  profile: CustomerProfile;
  baseApiUrl: string;
  onSuccess: () => void;
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

export default function EditProfile({
  profile,
  baseApiUrl,
  onSuccess,
}: EditProfileProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile?.name || "");
      setWhatsappNumber(profile?.whatsappNumber || profile?.phone || "");
    }
  }, [open, profile]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Nama tidak boleh kosong");
      return;
    }

    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const payload = {
        name: name.trim(),
        whatsappNumber: whatsappNumber.trim(),
      };

      console.log("UPDATE PROFILE PAYLOAD:", payload);

      const response = await fetch(`${baseApiUrl}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      console.log("UPDATE PROFILE RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal update profile");
        return;
      }

      alert("Profile berhasil diperbarui");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      alert("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b]"
      >
        <Pencil className="h-4 w-4" />
        Edit Profile
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-950">
                  Edit Profile
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Ubah data profile kamu sendiri.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700 transition hover:bg-red-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Nama
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#7f1d1d]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Nomor WhatsApp
                </label>

                <input
                  value={whatsappNumber}
                  onChange={(e) =>
                    setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-400 focus:border-[#7f1d1d]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Email
                </label>

                <input
                  value={profile?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 outline-none"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Email tidak bisa diubah dari sini.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Role
                </label>

                <input
                  value={profile?.role || "CUSTOMER"}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-600 outline-none"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Role tidak boleh diedit.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7]"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}