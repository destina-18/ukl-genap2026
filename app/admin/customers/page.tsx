"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users, RefreshCcw, Mail, Phone, Calendar } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import AddCustomer from "./add";
import DeleteCustomer from "./delete";
import ResetPasswordCustomer from "./resetpw";
import DetailCustomer from "./detail";
import VerifyCustomer from "./verify";

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

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function cleanBaseApiUrl(url: string) {
  return url.replace(/\/$/, "").replace(/\/api$/, "");
}

function getErrorMessage(data: any, fallback: string) {
  if (Array.isArray(data?.message)) {
    return data.message.join("\n");
  }

  return data?.message || fallback;
}

function getArrayFromResponse(response: any): Customer[] {
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
  return customer.whatsappNumber || customer.phone || "-";
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

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  const BASE_API_URL = cleanBaseApiUrl(
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app"
  );

  async function fetchCustomers() {
    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        setCustomers([]);
        return;
      }

      const url = `${BASE_API_URL}/api/admin/customers`;

      console.log("CUSTOMERS BASE API:", BASE_API_URL);
      console.log("CUSTOMERS URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      console.log("ADMIN CUSTOMERS STATUS:", res.status);
      console.log("ADMIN CUSTOMERS RESPONSE:", data);

      if (!res.ok) {
        alert(getErrorMessage(data, "Gagal mengambil data customer"));
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

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
    <main className="min-h-screen overflow-x-hidden bg-[#fff7f7] px-3 py-4 text-gray-900 sm:px-5 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* HEADER */}
        <section className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-5 text-white shadow-xl sm:p-7 md:mb-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-red-50 sm:text-sm">
                <Users className="h-4 w-4 shrink-0" />
                <span className="truncate">Customer Management</span>
              </div>

              <h1 className="text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
                Data Customer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-red-100 sm:text-base">
                Kelola data customer, tambah, hapus, reset password, lihat
                detail, dan verifikasi akun customer.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
              <div className="w-full sm:w-fit">
                <AddCustomer
                  baseApiUrl={BASE_API_URL}
                  onSuccess={fetchCustomers}
                />
              </div>

              <button
                type="button"
                onClick={fetchCustomers}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mb-6 xl:grid-cols-3">
          <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">
              Total Customer
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#7f1d1d] sm:text-4xl">
              {loading ? "..." : customers.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">
              Terverifikasi
            </p>
            <h2 className="mt-2 text-3xl font-black text-green-700 sm:text-4xl">
              {loading ? "..." : verifiedCount}
            </h2>
          </div>

          <div className="rounded-3xl border border-red-100 bg-white p-5 shadow-lg shadow-red-900/5 sm:col-span-2 xl:col-span-1">
            <p className="text-sm font-semibold text-gray-500">
              Belum Verifikasi
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#7f1d1d] sm:text-4xl">
              {loading ? "..." : unverifiedCount}
            </h2>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mb-5 rounded-3xl border border-red-100 bg-white p-4 shadow-lg shadow-red-900/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f1d1d]" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau no HP..."
              className="h-12 rounded-2xl border-red-100 bg-[#fff7f7] pl-11 text-sm font-medium focus-visible:ring-[#7f1d1d]"
            />
          </div>
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-xl shadow-red-900/5">
          <div className="border-b border-red-100 p-5">
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
            <>
              {/* MOBILE & TABLET CARD */}
              <div className="grid gap-4 p-4 xl:hidden">
                {filteredCustomers.map((customer, index) => {
                  const verified = isCustomerVerified(customer);

                  return (
                    <div
                      key={customer.id}
                      className="rounded-3xl border border-red-100 bg-[#fffafa] p-4 shadow-sm"
                    >
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#7f1d1d]/10 px-3 py-1 text-xs font-black text-[#7f1d1d]">
                              #{index + 1}
                            </span>

                            {verified ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                Terverifikasi
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                Belum
                              </Badge>
                            )}
                          </div>

                          <h3 className="break-words text-lg font-black text-gray-950">
                            {customer.name || "-"}
                          </h3>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm md:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#7f1d1d]" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-400">
                              Email
                            </p>
                            <p className="break-all font-semibold text-gray-700">
                              {customer.email || "-"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
                          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#7f1d1d]" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-400">
                              No HP
                            </p>
                            <p className="break-all font-semibold text-gray-700">
                              {getCustomerPhone(customer)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl bg-white p-3 md:col-span-2">
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#7f1d1d]" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-400">
                              Tanggal Dibuat
                            </p>
                            <p className="font-semibold text-gray-700">
                              {getCustomerCreatedAt(customer)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* AKSI MOBILE - INI SUDAH MENYAMPING */}
                      <div className="mt-4 flex flex-row flex-wrap items-center gap-2 border-t border-red-100 pt-4">
                        <DetailCustomer customer={customer} />

                        <ResetPasswordCustomer
                          customerId={customer.id}
                          baseApiUrl={BASE_API_URL}
                          onSuccess={fetchCustomers}
                        />

                        <DeleteCustomer
                          customerId={customer.id}
                          baseApiUrl={BASE_API_URL}
                          onSuccess={fetchCustomers}
                        />

                        {!verified && (
                          <VerifyCustomer
                            customerId={customer.id}
                            baseApiUrl={BASE_API_URL}
                            verifyingId={verifyingId}
                            setVerifyingId={setVerifyingId}
                            onSuccess={fetchCustomers}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden w-full overflow-x-auto xl:block">
                <table className="w-full min-w-[1050px] table-fixed">
                  <colgroup>
                    <col className="w-[6%]" />
                    <col className="w-[19%]" />
                    <col className="w-[27%]" />
                    <col className="w-[14%]" />
                    <col className="w-[14%]" />
                    <col className="w-[12%]" />
                    <col className="w-[18%]" />
                  </colgroup>

                  <thead className="bg-[#fff7f7]">
                    <tr>
                      <th className="border-b border-red-100 px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        No
                      </th>

                      <th className="border-b border-red-100 px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        Nama
                      </th>

                      <th className="border-b border-red-100 px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        Email
                      </th>

                      <th className="border-b border-red-100 px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        No HP
                      </th>

                      <th className="border-b border-red-100 px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        Verifikasi
                      </th>

                      <th className="border-b border-red-100 px-4 py-4 text-left text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        Tanggal
                      </th>

                      <th className="border-b border-red-100 px-4 py-4 text-center text-xs font-black uppercase tracking-widest text-[#7f1d1d]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredCustomers.map((customer, index) => {
                      const verified = isCustomerVerified(customer);

                      return (
                        <tr
                          key={customer.id}
                          className="border-b border-red-50 hover:bg-[#fff7f7]"
                        >
                          <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                            {index + 1}
                          </td>

                          <td className="px-4 py-4 text-sm font-black text-gray-950">
                            <div
                              className="truncate"
                              title={customer.name || "-"}
                            >
                              {customer.name || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            <div
                              className="truncate"
                              title={customer.email || "-"}
                            >
                              {customer.email || "-"}
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            <div
                              className="truncate whitespace-nowrap"
                              title={getCustomerPhone(customer)}
                            >
                              {getCustomerPhone(customer)}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            {verified ? (
                              <Badge className="whitespace-nowrap bg-green-100 text-green-700 hover:bg-green-100">
                                Terverifikasi
                              </Badge>
                            ) : (
                              <Badge className="whitespace-nowrap bg-red-100 text-red-700 hover:bg-red-100">
                                Belum
                              </Badge>
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-gray-700">
                            <div className="whitespace-nowrap">
                              {getCustomerCreatedAt(customer)}
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-row flex-wrap items-center justify-center gap-2">
                              <DetailCustomer customer={customer} />

                              <ResetPasswordCustomer
                                customerId={customer.id}
                                baseApiUrl={BASE_API_URL}
                                onSuccess={fetchCustomers}
                              />

                              <DeleteCustomer
                                customerId={customer.id}
                                baseApiUrl={BASE_API_URL}
                                onSuccess={fetchCustomers}
                              />

                              {!verified && (
                                <VerifyCustomer
                                  customerId={customer.id}
                                  baseApiUrl={BASE_API_URL}
                                  verifyingId={verifyingId}
                                  setVerifyingId={setVerifyingId}
                                  onSuccess={fetchCustomers}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}