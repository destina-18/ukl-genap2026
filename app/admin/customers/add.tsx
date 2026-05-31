"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
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

export default function AddCustomer({ baseApiUrl, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setWhatsappNumber("");
    setAddress("");
    setPassword("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !email || !whatsappNumber || !password) {
      alert("Nama, email, nomor HP, dan password wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      const res = await fetch(`${baseApiUrl}/api/admin/customers`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          whatsappNumber,
          address,
          password,
        }),
      });

      const data = await res.json().catch(() => null);
      console.log("ADD CUSTOMER:", data);

      if (!res.ok) {
        alert(data?.message || "Gagal tambah customer");
        return;
      }

      alert("Customer berhasil ditambahkan");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat tambah customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white hover:bg-[#991b1b]"
      >
        <Plus className="h-4 w-4" />
        Tambah
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Tambah Customer</h2>

              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama customer"
              />

              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email customer"
              />

              <Input
                value={whatsappNumber}
                onChange={(e) =>
                  setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Nomor WhatsApp"
              />

              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Alamat"
              />

              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border px-4 py-2 text-sm font-bold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#7f1d1d] px-4 py-2 text-sm font-bold text-white disabled:opacity-70"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}