"use client";

import { Eye, X } from "lucide-react";
import { useState } from "react";

type Customer = {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  address?: string;

  is_verified?: boolean;
  isVerified?: boolean;
  verified?: boolean;
  emailVerified?: boolean;
  isEmailVerified?: boolean;
  otpVerified?: boolean;
  verifiedAt?: string | null;
  emailVerifiedAt?: string | null;

  created_at?: string;
  createdAt?: string;

  [key: string]: any;
};

type Props = {
  customer: Customer;
};

function getCustomerPhone(customer: Customer) {
  return customer.phone || customer.whatsappNumber || "-";
}

function isCustomerVerified(customer: Customer) {
  return (
    customer.is_verified === true ||
    customer.isVerified === true ||
    customer.verified === true ||
    customer.emailVerified === true ||
    customer.isEmailVerified === true ||
    customer.otpVerified === true ||
    Boolean(customer.verifiedAt) ||
    Boolean(customer.emailVerifiedAt)
  );
}

function getCustomerCreatedAt(customer: Customer) {
  const date = customer.created_at || customer.createdAt;

  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DetailCustomer({ customer }: Props) {
  const [open, setOpen] = useState(false);
  const verified = isCustomerVerified(customer);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f1d1d]/20 text-[#7f1d1d] hover:bg-[#fff7f7]"
        title="Detail"
      >
        <Eye className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Detail Customer
                </h2>
                <p className="text-sm text-gray-500">
                  Informasi lengkap customer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:bg-red-50 hover:text-[#7f1d1d]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-[#fff7f7] p-4">
                <p className="font-bold text-gray-500">Nama</p>
                <p className="font-black text-gray-900">
                  {customer.name || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7f7] p-4">
                <p className="font-bold text-gray-500">Email</p>
                <p className="font-black text-gray-900">
                  {customer.email || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7f7] p-4">
                <p className="font-bold text-gray-500">No HP</p>
                <p className="font-black text-gray-900">
                  {getCustomerPhone(customer)}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7f7] p-4">
                <p className="font-bold text-gray-500">Alamat</p>
                <p className="font-black text-gray-900">
                  {customer.address || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7f7] p-4">
                <p className="font-bold text-gray-500">Status Verifikasi</p>
                <p
                  className={`font-black ${
                    verified ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {verified ? "Terverifikasi" : "Belum Verifikasi"}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7f7] p-4">
                <p className="font-bold text-gray-500">Tanggal Daftar</p>
                <p className="font-black text-gray-900">
                  {getCustomerCreatedAt(customer)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#7f1d1d] px-5 py-2 text-sm font-bold text-white hover:bg-[#991b1b]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}