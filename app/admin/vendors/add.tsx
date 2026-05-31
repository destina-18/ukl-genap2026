"use client";

import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";

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

type AddVendorProps = {
  baseApiUrl: string;
  onSuccess: () => void;
};

type ApiResponse = {
  data?: any;
  id?: number;
  vendor?: {
    id?: number;
  };
  message?: string;
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

function getCreatedVendorId(data: ApiResponse) {
  return (
    data?.data?.id ||
    data?.data?.vendor?.id ||
    data?.vendor?.id ||
    data?.id ||
    null
  );
}

export default function AddVendor({ baseApiUrl, onSuccess }: AddVendorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [canteenNumber, setCanteenNumber] = useState<number>(1);
  const [canteenName, setCanteenName] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  function resetForm() {
    setEmail("");
    setPassword("");
    setName("");
    setWhatsappNumber("");
    setCanteenNumber(1);
    setCanteenName("");
    setDescription("");
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

      const res = await fetch(`${baseApiUrl}/api/admin/vendors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          password,
          name,
          whatsappNumber,
          canteenNumber,
          canteenName,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menambahkan vendor");
        return;
      }

      if (logoFile) {
        const createdVendorId = getCreatedVendorId(data);

        if (createdVendorId) {
          await uploadLogo(createdVendorId, logoFile);
        } else {
          alert(
            "Vendor berhasil ditambahkan, tapi logo belum bisa diupload karena ID vendor tidak ditemukan."
          );
        }
      }

      alert("Vendor berhasil ditambahkan");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("ADD VENDOR ERROR:", error);
      alert("Terjadi kesalahan saat menambahkan vendor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 hover:bg-white">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Vendor
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-[#7f1d1d]/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#7f1d1d]">
            Tambah Vendor
          </DialogTitle>
          <DialogDescription>
            Isi data vendor baru. Logo bisa dipilih dari file.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendor@kantinklik.com"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              required
              className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
            />
          </div>

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
            <Label className="font-bold text-gray-700">Logo Vendor</Label>
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
              {loading ? "Menyimpan..." : "Tambah Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}