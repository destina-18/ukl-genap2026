"use client";

import { useState } from "react";
import { Power, PowerOff } from "lucide-react";

import { Button } from "@/components/ui/button";

type Vendor = {
  id: number;
  name?: string;
  whatsappNumber?: string;
  whatsapp_number?: string;
  canteenNumber?: number;
  canteen_number?: number;
  canteenName?: string;
  canteen_name?: string;
  description?: string;
  isActive?: boolean;
  is_active?: boolean;
  user?: {
    name?: string;
    whatsappNumber?: string;
    whatsapp_number?: string;
  };
};

type StatusVendorProps = {
  selectedData: Vendor;
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

function getToken() {
  return getCookie("accesstoken") || getCookie("accessToken");
}

function getVendorName(vendor: Vendor) {
  return vendor.name || vendor.user?.name || "";
}

function getVendorWhatsapp(vendor: Vendor) {
  return (
    vendor.whatsappNumber ||
    vendor.whatsapp_number ||
    vendor.user?.whatsappNumber ||
    vendor.user?.whatsapp_number ||
    ""
  );
}

function getCanteenNumber(vendor: Vendor) {
  return vendor.canteenNumber || vendor.canteen_number || 1;
}

function getCanteenName(vendor: Vendor) {
  return vendor.canteenName || vendor.canteen_name || "";
}

function getIsActive(vendor: Vendor) {
  return vendor.isActive !== false && vendor.is_active !== false;
}

export default function StatusVendor({
  selectedData,
  baseApiUrl,
  onSuccess,
}: StatusVendorProps) {
  const [loading, setLoading] = useState(false);

  const isActive = getIsActive(selectedData);

  async function handleToggleActive() {
    const newStatus = !isActive;

    const confirmChange = confirm(
      newStatus
        ? "Yakin ingin mengaktifkan vendor ini?"
        : "Yakin ingin menonaktifkan vendor ini?"
    );

    if (!confirmChange) return;

    try {
      setLoading(true);

      if (!baseApiUrl) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
        return;
      }

      const res = await fetch(
        `${baseApiUrl}/api/admin/vendors/${selectedData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: getVendorName(selectedData),
            whatsappNumber: getVendorWhatsapp(selectedData),
            canteenNumber: Number(getCanteenNumber(selectedData)) || 1,
            canteenName: getCanteenName(selectedData),
            description: selectedData.description || "",
            isActive: newStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengubah status vendor");
        return;
      }

      alert(
        newStatus
          ? "Vendor berhasil diaktifkan"
          : "Vendor berhasil dinonaktifkan"
      );

      onSuccess();
    } catch (error) {
      console.error("TOGGLE VENDOR ERROR:", error);
      alert("Terjadi kesalahan saat mengubah status vendor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      disabled={loading}
      onClick={handleToggleActive}
      title={isActive ? "Nonaktifkan vendor" : "Aktifkan vendor"}
      className={
        isActive
          ? "rounded-xl border border-[#7f1d1d]/20 bg-white text-[#7f1d1d] hover:bg-[#fff7f7] disabled:opacity-70"
          : "rounded-xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] text-white hover:opacity-90 disabled:opacity-70"
      }
    >
      {isActive ? (
        <PowerOff className="h-4 w-4" />
      ) : (
        <Power className="h-4 w-4" />
      )}
    </Button>
  );
}