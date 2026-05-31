"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

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

export default function DeleteMenu({
  menuId,
  onSuccess,
}: {
  menuId: number;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

  async function handleDelete() {
    const confirmDelete = confirm(
      "Yakin ingin menghapus menu ini? Data akan dihapus secara soft delete."
    );

    if (!confirmDelete) return;

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

      const res = await fetch(`${BASE_API_URL}/api/vendor/menus/${menuId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("DELETE MENU:", data);

      if (!res.ok) {
        alert(data.message || "Gagal menghapus menu");
        return;
      }

      alert("Menu berhasil dihapus");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus menu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-4 py-2 text-xs font-black text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Trash2 size={15} />
      {loading ? "Hapus..." : "Hapus"}
    </button>
  );
}