"use client";

import { FormEvent, useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type Customer = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;
};

type Props = {
  customer: Customer;
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

export default function EditCustomer({ customer, baseApiUrl, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(customer.name || "");
  const [email, setEmail] = useState(customer.email || "");
  const [whatsappNumber, setWhatsappNumber] = useState(
    customer.whatsappNumber || customer.phone || ""
  );
  const [address, setAddress] = useState(customer.address || "");

  useEffect(() => {
    setName(customer.name || "");
    setEmail(customer.email || "");
    setWhatsappNumber(customer.whatsappNumber || customer.phone || "");
    setAddress(customer.address || "");
  }, [customer]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !email || !whatsappNumber) {
      alert("Nama, email, dan nomor HP wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      const res = await fetch(`${baseApiUrl}/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          whatsappNumber,
          address,
        }),
      });

      const data = await res.json().catch(() => null);
      console.log("EDIT CUSTOMER:", data);

      if (!res.ok) {
        alert(data?.message || "Gagal edit customer");
        return;
      }

      alert("Customer berhasil diedit");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat edit customer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f1d1d]/20 text-[#7f1d1d] hover:bg-[#fff7f7]"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">Edit Customer</h2>

              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input value={name} onChange={(e) => setName(e.target.value)} />

              <Input value={email} onChange={(e) => setEmail(e.target.value)} />

              <Input
                value={whatsappNumber}
                onChange={(e) =>
                  setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                }
              />

              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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