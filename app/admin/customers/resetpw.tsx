"use client";

import { FormEvent, useState } from "react";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

type ResetPasswordCustomerProps = {
  customerId: number;
  customerName?: string;
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
  if (typeof window === "undefined") return "";

  return getCookie("accessToken") || localStorage.getItem("accessToken") || "";
}

function getErrorMessage(data: any, fallback: string) {
  if (Array.isArray(data?.message)) return data.message.join(", ");
  return data?.message || fallback;
}

export default function ResetPasswordCustomer({
  customerId,
  customerName,
  baseApiUrl,
  onSuccess,
}: ResetPasswordCustomerProps) {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleClose() {
    if (loading) return;

    setOpen(false);
    setNewPassword("");
    setShowPassword(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newPassword.trim()) {
      alert("Password baru wajib diisi");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password baru minimal 6 karakter");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const res = await fetch(
        `${baseApiUrl}/api/admin/customers/${customerId}/reset-password`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: newPassword,
          }),
        }
      );

      const data = await res.json().catch(() => null);
      console.log("RESET PASSWORD CUSTOMER:", data);

      if (!res.ok) {
        alert(getErrorMessage(data, "Gagal reset password customer"));
        return;
      }

      alert("Password customer berhasil direset");

      setNewPassword("");
      setShowPassword(false);
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat reset password customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-300 text-yellow-700 transition hover:bg-yellow-50"
        title="Reset password customer"
      >
        <KeyRound className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Reset Password
                </h2>

                {customerName && (
                  <p className="mt-1 text-sm text-slate-500">
                    Customer:{" "}
                    <span className="font-bold text-slate-700">
                      {customerName}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-slate-700">
                  Password Baru
                </label>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Password baru"
                    className="pr-11"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Password ini akan langsung mengganti password customer.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="rounded-xl border px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#7f1d1d] px-4 py-2 text-sm font-bold text-white hover:bg-[#991b1b] disabled:opacity-70"
                >
                  {loading ? "Menyimpan..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}