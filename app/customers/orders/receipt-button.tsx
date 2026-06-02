"use client";

import { useState } from "react";
import { Download } from "lucide-react";

type ReceiptButtonProps = {
  orderId: number | string;
  orderStatus: string;
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

export default function ReceiptButton({
  orderId,
  orderStatus,
}: ReceiptButtonProps) {
  const [loading, setLoading] = useState(false);

  const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

  const isCompleted = orderStatus?.toUpperCase() === "COMPLETED";

  async function handleDownloadReceipt() {
    try {
      setLoading(true);

      const token =
        getCookie("accessToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        "";

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai customer.");
        return;
      }

      const response = await fetch(`${baseApiUrl}/api/orders/${orderId}/receipt`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        let message = "Gagal download struk.";

        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          // kalau response bukan json, biarin pakai message default
        }

        alert(message);
        return;
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `struk-order-${orderId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOWNLOAD RECEIPT ERROR:", error);
      alert("Terjadi kesalahan saat download struk.");
    } finally {
      setLoading(false);
    }
  }

  if (!isCompleted) return null;

  return (
    <button
      type="button"
      onClick={handleDownloadReceipt}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download size={16} />
      {loading ? "Downloading..." : "Download Struk"}
    </button>
  );
}