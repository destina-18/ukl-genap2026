"use client";

import { ShieldCheck } from "lucide-react";

type Props = {
  customerId: number;
  baseApiUrl: string;
  verifyingId: number | null;
  setVerifyingId: (id: number | null) => void;
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

export default function VerifyCustomer({
  customerId,
  baseApiUrl,
  verifyingId,
  setVerifyingId,
  onSuccess,
}: Props) {
  async function handleVerify() {
    const confirmVerify = confirm("Yakin ingin verifikasi customer ini?");

    if (!confirmVerify) return;

    try {
      setVerifyingId(customerId);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const res = await fetch(
        `${baseApiUrl}/api/admin/customers/${customerId}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);
      console.log("VERIFY CUSTOMER:", data);

      if (!res.ok) {
        alert(data?.message || "Gagal verifikasi customer");
        return;
      }

      alert("Customer berhasil diverifikasi");
      onSuccess();
    } catch (error) {
      console.error("VERIFY CUSTOMER ERROR:", error);
      alert("Terjadi kesalahan saat verifikasi customer");
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <button
      type="button"
      onClick={handleVerify}
      disabled={verifyingId === customerId}
      className="flex items-center gap-2 rounded-xl bg-[#7f1d1d] px-4 py-2 text-sm font-black text-white hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
      title="Verify"
    >
      <ShieldCheck className="h-4 w-4" />
      {verifyingId === customerId ? "..." : "Verify"}
    </button>
  );
}