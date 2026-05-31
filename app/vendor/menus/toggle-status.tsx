"use client";

import { useState } from "react";
import { Power, PowerOff } from "lucide-react";

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

function getMenuName(menu: any) {
  return menu.name || menu.menuName || "-";
}

function getMenuCategoryId(menu: any) {
  return menu.categoryId || menu.category_id || menu.category?.id || 0;
}

function getMenuAvailable(menu: any) {
  if (typeof menu.isAvailable === "boolean") return menu.isAvailable;
  if (typeof menu.is_available === "boolean") return menu.is_available;

  return Number(menu.stock || 0) > 0;
}

export default function ToggleMenuStatus({
  menu,
  onSuccess,
}: {
  menu: any;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
  const available = getMenuAvailable(menu);

  async function handleToggleAvailable() {
    const nextAvailable = !available;

    const confirmChange = confirm(
      nextAvailable
        ? "Yakin ingin mengaktifkan menu ini?"
        : "Yakin ingin menonaktifkan menu ini?"
    );

    if (!confirmChange) return;

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

      const baseBody = {
        name: getMenuName(menu),
        description: menu.description || "",
        price: Number(menu.price || 0),
        stock: nextAvailable
          ? Number(menu.stock || 1) <= 0
            ? 1
            : Number(menu.stock || 1)
          : 0,
        categoryId: getMenuCategoryId(menu),
      };

      let res = await fetch(`${BASE_API_URL}/api/vendor/menus/${menu.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...baseBody,
          isAvailable: nextAvailable,
        }),
      });

      let data = await res.json();
      console.log("TOGGLE MENU RESPONSE 1:", data);

      if (!res.ok && JSON.stringify(data).includes("isAvailable")) {
        res = await fetch(`${BASE_API_URL}/api/vendor/menus/${menu.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(baseBody),
        });

        data = await res.json();
        console.log("TOGGLE MENU RESPONSE 2:", data);
      }

      if (!res.ok) {
        alert(data.message || "Gagal mengubah status menu");
        return;
      }

      alert(
        nextAvailable
          ? "Menu berhasil diaktifkan"
          : "Menu berhasil dinonaktifkan"
      );

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengubah status menu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleAvailable}
      disabled={loading}
      className={
        available
          ? "inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-xs font-black text-[#7f1d1d] hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          : "inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-xs font-black text-green-700 hover:bg-green-200 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {available ? <PowerOff size={15} /> : <Power size={15} />}
      {loading ? "Loading..." : available ? "Nonaktifkan" : "Aktifkan"}
    </button>
  );
}