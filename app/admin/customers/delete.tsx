"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

type Props = {
  customerId: number;
  baseApiUrl: string;
  onSuccess: () => void;
};

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || "";
  return "";
}

export default function DeleteCustomer({
  customerId,
  baseApiUrl,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmDelete = confirm("Yakin ingin menghapus customer ini?");

    if (!confirmDelete) return;

    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      const res = await fetch(`${baseApiUrl}/api/admin/customers/${customerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      console.log("DELETE CUSTOMER:", data);

      if (!res.ok) {
        alert(data?.message || "Gagal hapus customer");
        return;
      }

      alert("Customer berhasil dihapus");
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat hapus customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-70"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}