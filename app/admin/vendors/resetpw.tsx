"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";

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
  name?: string;
  email?: string;
  user?: {
    name?: string;
    email?: string;
  };
};

type ResetPasswordVendorProps = {
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
  return vendor.name || vendor.user?.name || "Vendor";
}

export default function ResetPasswordVendor({
  selectedData,
  baseApiUrl,
  onSuccess,
}: ResetPasswordVendorProps) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setNewPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.length < 6) {
      alert("Password minimal 6 karakter");
      return;
    }

    const confirmReset = confirm(
      `Yakin ingin reset password untuk ${getVendorName(selectedData)}?`
    );

    if (!confirmReset) return;

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
        `${baseApiUrl}/api/admin/vendors/${selectedData.id}/reset-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal reset password vendor");
        return;
      }

      alert("Password vendor berhasil direset");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("RESET PASSWORD VENDOR ERROR:", error);
      alert("Terjadi kesalahan saat reset password vendor");
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
        <Button
          size="sm"
          variant="outline"
          title="Reset password vendor"
          className="rounded-xl border-[#7f1d1d]/20 text-[#7f1d1d] hover:bg-[#fff7f7] hover:text-[#450a0a]"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="rounded-[2rem] border-[#7f1d1d]/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-[#7f1d1d]">
            Reset Password Vendor
          </DialogTitle>

          <DialogDescription>
            Ubah password untuk vendor{" "}
            <span className="font-bold text-[#7f1d1d]">
              {getVendorName(selectedData)}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Password Baru</Label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                required
                className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] pr-12 focus-visible:ring-[#7f1d1d]"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#7f1d1d]"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-xs font-medium text-gray-500">
              Minimal 6 karakter.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-6 font-black text-white shadow-lg shadow-red-900/20 hover:opacity-90 disabled:opacity-70"
            >
              {loading ? "Mereset..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}