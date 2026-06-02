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

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function getErrorMessage(data: any) {
  if (Array.isArray(data?.message)) {
    return data.message.join("\n");
  }

  return data?.message || "Gagal edit customer";
}

function cleanBaseApiUrl(url: string) {
  return url.replace(/\/$/, "").replace(/\/api$/, "");
}

export default function EditCustomer({ customer, baseApiUrl, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  function fillForm() {
    setName(customer.name || "");
    setEmail(customer.email || "");
    setWhatsappNumber(customer.whatsappNumber || customer.phone || "");
  }

  useEffect(() => {
    fillForm();
  }, [customer]);

  function handleOpen() {
    fillForm();
    setOpen(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanWhatsappNumber = whatsappNumber.trim();

    if (!cleanName || !cleanEmail || !cleanWhatsappNumber) {
      alert("Nama, email, dan nomor HP wajib diisi");
      return;
    }

    if (!cleanEmail.includes("@")) {
      alert("Format email tidak valid");
      return;
    }

    if (cleanWhatsappNumber.length < 10) {
      alert("Nomor HP minimal 10 digit");
      return;
    }

    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        return;
      }

      const cleanBaseUrl = cleanBaseApiUrl(baseApiUrl);
      const url = `${cleanBaseUrl}/api/admin/customers/${customer.id}`;

      console.log("EDIT CUSTOMER BASE URL:", cleanBaseUrl);
      console.log("EDIT CUSTOMER URL:", url);

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          whatsappNumber: cleanWhatsappNumber,
        }),
      });

      const data = await res.json().catch(() => null);

      console.log("EDIT CUSTOMER STATUS:", res.status);
      console.log("EDIT CUSTOMER RESPONSE:", data);

      if (!res.ok) {
        alert(getErrorMessage(data));
        return;
      }

      alert("Customer berhasil diedit");
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("EDIT CUSTOMER ERROR:", error);
      alert("Gagal terhubung ke backend. Cek URL API, CORS, atau server Railway.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f1d1d]/20 text-[#7f1d1d] transition hover:bg-[#fff7f7]"
        title="Edit customer"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#2b1111]">
                Edit Customer
              </h2>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Nama
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama customer"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email customer"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-gray-700">
                  Nomor HP
                </label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) =>
                    setWhatsappNumber(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Masukkan nomor HP"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="rounded-xl border px-4 py-2 text-sm font-bold hover:bg-gray-50 disabled:opacity-70"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#7f1d1d] px-4 py-2 text-sm font-bold text-white hover:bg-[#681818] disabled:opacity-70"
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