"use client";

import { FormEvent, useState } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Vendor = {
  id: number;
  email?: string;
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
    id?: number;
    name?: string;
    email?: string;
    whatsappNumber?: string;
    whatsapp_number?: string;
  };
};

type EditVendorProps = {
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

export default function EditVendor({
  selectedData,
  baseApiUrl,
  onSuccess,
}: EditVendorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(getVendorName(selectedData));
  const [whatsappNumber, setWhatsappNumber] = useState(
    getVendorWhatsapp(selectedData)
  );
  const [canteenNumber, setCanteenNumber] = useState<number>(
    Number(getCanteenNumber(selectedData)) || 1
  );
  const [canteenName, setCanteenName] = useState(
    getCanteenName(selectedData)
  );
  const [description, setDescription] = useState(
    selectedData.description || ""
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);

  function resetForm() {
    setName(getVendorName(selectedData));
    setWhatsappNumber(getVendorWhatsapp(selectedData));
    setCanteenNumber(Number(getCanteenNumber(selectedData)) || 1);
    setCanteenName(getCanteenName(selectedData));
    setDescription(selectedData.description || "");
    setLogoFile(null);
  }

  async function uploadLogo(vendorId: number, file: File) {
    const token = getToken();

    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
      return false;
    }

    const formData = new FormData();

    // Kalau backend kamu minta field "logo", ganti "file" jadi "logo"
    formData.append("file", file);

    const res = await fetch(`${baseApiUrl}/api/admin/vendors/${vendorId}/logo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gagal upload logo vendor");
      return false;
    }

    return true;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
            name,
            whatsappNumber,
            canteenNumber,
            canteenName,
            description,
            isActive: getIsActive(selectedData),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengupdate vendor");
        return;
      }

      if (logoFile) {
        await uploadLogo(selectedData.id, logoFile);
      }

      alert("Vendor berhasil diupdate");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("EDIT VENDOR ERROR:", error);
      alert("Terjadi kesalahan saat mengupdate vendor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          title="Edit vendor"
          className="rounded-xl border-[#7f1d1d]/20 text-[#7f1d1d] hover:bg-[#fff7f7] hover:text-[#450a0a]"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-[#7f1d1d]/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#7f1d1d]">
            Edit Vendor
          </DialogTitle>
          <DialogDescription>
            Ubah data vendor. Email dan password tidak diedit di sini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Nama Pemilik</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pak Budi"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Nomor WhatsApp</Label>
            <Input
              value={whatsappNumber}
              onChange={(e) =>
                setWhatsappNumber(e.target.value.replace(/\D/g, ""))
              }
              placeholder="081234567890"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Nomor Kantin</Label>
            <Input
              value={canteenNumber}
              onChange={(e) =>
                setCanteenNumber(Number(e.target.value.replace(/\D/g, "")) || 1)
              }
              placeholder="1"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Nama Kantin</Label>
            <Input
              value={canteenName}
              onChange={(e) => setCanteenName(e.target.value)}
              placeholder="Kantin Barokah"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Deskripsi</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Menyajikan makanan halal dan lezat"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Ganti Logo Vendor</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] file:mr-4 file:rounded-full file:border-0 file:bg-[#7f1d1d] file:px-4 file:py-1 file:text-sm file:font-bold file:text-white"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-6 font-black text-white shadow-lg shadow-red-900/20 hover:opacity-90 disabled:opacity-70"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}