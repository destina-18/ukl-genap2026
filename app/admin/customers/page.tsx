"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ShieldCheck, Eye, Users, RefreshCcw } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
  verifiedAt?: string;
  emailVerifiedAt?: string;

  created_at?: string;
  createdAt?: string;

  [key: string]: any;
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

function getArrayFromResponse(response: any) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;

  if (Array.isArray(response?.customers)) return response.customers;
  if (Array.isArray(response?.data?.customers)) return response.data.customers;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.result)) return response.data.result;

  return [];
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

function getCustomerPhone(customer: Customer) {
  return customer.phone || customer.whatsappNumber || "-";
}

function getCustomerCreatedAt(customer: Customer) {
  const date = customer.created_at || customer.createdAt;

  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  async function fetchCustomers() {
    try {
      setLoading(true);

      const token = getCookie("accessToken") || localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_API_URL}/api/admin/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);
      console.log("ADMIN CUSTOMERS RESPONSE:", data);

      if (!res.ok) {
        alert(data?.message || "Gagal mengambil data customer");
        setCustomers([]);
        return;
      }

      setCustomers(getArrayFromResponse(data));
    } catch (error) {
      console.error("FETCH CUSTOMERS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil data customer");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id: number) {
    const confirmVerify = confirm(
      "Yakin ingin mengubah status verifikasi customer ini?"
    );

    if (!confirmVerify) return;

    try {
      setVerifyingId(id);

      const token = getCookie("accessToken") || localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_API_URL}/api/admin/customers/${id}/verify`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => null);
      console.log("VERIFY CUSTOMER RESPONSE:", data);

      if (!res.ok) {
        alert(data?.message || "Gagal mengubah verifikasi customer");
        return;
      }

      alert("Verifikasi customer berhasil diubah");
      fetchCustomers();
    } catch (error) {
      console.error("VERIFY CUSTOMER ERROR:", error);
      alert("Terjadi kesalahan saat verifikasi customer");
    } finally {
      setVerifyingId(null);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase();

    return customers.filter((customer) => {
      return (
        String(customer.name || "").toLowerCase().includes(keyword) ||
        String(customer.email || "").toLowerCase().includes(keyword) ||
        String(customer.phone || "").toLowerCase().includes(keyword) ||
        String(customer.whatsappNumber || "").toLowerCase().includes(keyword) ||
        String(customer.address || "").toLowerCase().includes(keyword)
      );
    });
  }, [customers, search]);

  const verifiedCount = customers.filter((customer) =>
    isCustomerVerified(customer)
  ).length;

  const unverifiedCount = customers.length - verifiedCount;

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[120px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Users className="h-4 w-4" />
                Customer Management
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Data Customer
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Kelola data customer KantinKlik, lihat detail pengguna, dan ubah
                status verifikasi akun.
              </p>
            </div>

            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Total Customer</p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : customers.length}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Terverifikasi</p>
            <h2 className="mt-2 text-4xl font-black text-green-700">
              {loading ? "..." : verifiedCount}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">
              Belum Verifikasi
            </p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : unverifiedCount}
            </h2>
          </div>
        </section>

        <section className="mb-5 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-4 shadow-lg shadow-red-900/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f1d1d]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, no HP, atau alamat..."
              className="h-12 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] pl-11 font-medium focus-visible:ring-[#7f1d1d]"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
          <div className="border-b border-[#7f1d1d]/10 bg-white p-5">
            <h2 className="text-lg font-black text-gray-950">
              Daftar Customer
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Total hasil ditampilkan: {filteredCustomers.length}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Mengambil data customer...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Data customer tidak ditemukan.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#fff7f7] hover:bg-[#fff7f7]">
                    <TableHead className="font-black text-[#7f1d1d]">No</TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">Nama</TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">Email</TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">No HP</TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">Alamat</TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Verifikasi
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Tanggal Daftar
                    </TableHead>
                    <TableHead className="text-center font-black text-[#7f1d1d]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCustomers.map((customer, index) => {
                    const verified = isCustomerVerified(customer);

                    return (
                      <TableRow
                        key={customer.id}
                        className="border-[#7f1d1d]/10 hover:bg-[#fff7f7]"
                      >
                        <TableCell className="font-semibold">
                          {index + 1}
                        </TableCell>

                        <TableCell className="font-black text-gray-950">
                          {customer.name || "-"}
                        </TableCell>

                        <TableCell className="font-medium text-gray-700">
                          {customer.email || "-"}
                        </TableCell>

                        <TableCell className="font-medium text-gray-700">
                          {getCustomerPhone(customer)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-700">
                          {customer.address || "-"}
                        </TableCell>

                        <TableCell>
                          {verified ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                              Terverifikasi
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                              Belum Verifikasi
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="font-medium text-gray-700">
                          {getCustomerCreatedAt(customer)}
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                alert(
                                  `Nama: ${customer.name || "-"}\nEmail: ${
                                    customer.email || "-"
                                  }\nNo HP: ${getCustomerPhone(customer)}`
                                );
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#7f1d1d]/20 text-[#7f1d1d] transition hover:bg-[#fff7f7]"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {!verified && (
                              <button
                                type="button"
                                onClick={() => handleVerify(customer.id)}
                                disabled={verifyingId === customer.id}
                                className="flex items-center gap-2 rounded-xl bg-[#7f1d1d] px-4 py-2 text-sm font-black text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                <ShieldCheck className="h-4 w-4" />
                                {verifyingId === customer.id
                                  ? "..."
                                  : "Verify"}
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}