"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Search, Store, Mail, Phone, Hash } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import AddVendor from "./add";
import EditVendor from "./edit";
import StatusVendor from "./status";
import ResetPasswordVendor from "./resetpw";

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

  logo?: string;
  logoUrl?: string;
  logo_url?: string;

  user?: {
    id?: number;
    name?: string;
    email?: string;
    whatsappNumber?: string;
    whatsapp_number?: string;
  };
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
  return vendor.name || vendor.user?.name || "-";
}

function getVendorEmail(vendor: Vendor) {
  return vendor.email || vendor.user?.email || "-";
}

function getVendorWhatsapp(vendor: Vendor) {
  return (
    vendor.whatsappNumber ||
    vendor.whatsapp_number ||
    vendor.user?.whatsappNumber ||
    vendor.user?.whatsapp_number ||
    "-"
  );
}

function getCanteenNumber(vendor: Vendor) {
  return vendor.canteenNumber || vendor.canteen_number || "-";
}

function getCanteenName(vendor: Vendor) {
  return vendor.canteenName || vendor.canteen_name || "-";
}

function getLogo(vendor: Vendor) {
  return vendor.logoUrl || vendor.logo_url || vendor.logo || "";
}

function getIsActive(vendor: Vendor) {
  return vendor.isActive !== false && vendor.is_active !== false;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";

  async function fetchVendors() {
    try {
      setLoading(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
        return;
      }

      const res = await fetch(`${BASE_API_URL}/api/admin/vendors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengambil data vendor");
        return;
      }

      const result = data.data || data;

      if (Array.isArray(result)) {
        setVendors(result);
      } else if (Array.isArray(result?.vendors)) {
        setVendors(result.vendors);
      } else if (Array.isArray(result?.data)) {
        setVendors(result.data);
      } else {
        setVendors([]);
      }
    } catch (error) {
      console.error("FETCH VENDORS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil data vendor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter((vendor) => {
    const keyword = search.toLowerCase();

    return (
      getVendorName(vendor).toLowerCase().includes(keyword) ||
      getVendorEmail(vendor).toLowerCase().includes(keyword) ||
      getVendorWhatsapp(vendor).toLowerCase().includes(keyword) ||
      getCanteenName(vendor).toLowerCase().includes(keyword)
    );
  });

  const activeVendors = vendors.filter((vendor) => getIsActive(vendor)).length;
  const inactiveVendors = vendors.length - activeVendors;

  return (
    <main className="min-h-screen bg-[#fff7f7] px-3 py-4 text-gray-900 sm:px-5 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* HEADER */}
        <section className="mb-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-5 text-white shadow-2xl shadow-red-900/20 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-red-50 backdrop-blur sm:text-sm">
                <Store className="h-4 w-4 shrink-0" />
                <span className="truncate">Vendor Management</span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                Data Vendor
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-red-100 sm:text-base">
                Kelola akun vendor kantin, data pemilik, nomor kantin, logo,
                reset password, dan status aktif vendor.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <button
                type="button"
                onClick={fetchVendors}
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 text-sm font-black text-white backdrop-blur transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <div className="w-full sm:w-fit">
                <AddVendor baseApiUrl={BASE_API_URL} onSuccess={fetchVendors} />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Total Vendor</p>
            <h2 className="mt-2 text-3xl font-black text-[#7f1d1d] sm:text-4xl">
              {loading ? "..." : vendors.length}
            </h2>
          </div>

          <div className="rounded-3xl border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Vendor Aktif</p>
            <h2 className="mt-2 text-3xl font-black text-green-700 sm:text-4xl">
              {loading ? "..." : activeVendors}
            </h2>
          </div>

          <div className="rounded-3xl border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 sm:col-span-2 xl:col-span-1">
            <p className="text-sm font-semibold text-gray-500">
              Vendor Nonaktif
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#7f1d1d] sm:text-4xl">
              {loading ? "..." : inactiveVendors}
            </h2>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mb-5 rounded-3xl border border-[#7f1d1d]/10 bg-white p-4 shadow-lg shadow-red-900/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f1d1d]" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, WhatsApp, atau nama kantin..."
              className="h-12 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] pl-11 text-sm font-medium focus-visible:ring-[#7f1d1d]"
            />
          </div>
        </section>

        {/* CONTENT */}
        <section className="overflow-hidden rounded-3xl border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
          <div className="border-b border-[#7f1d1d]/10 bg-white p-5">
            <h2 className="text-lg font-black text-gray-950">Daftar Vendor</h2>
            <p className="mt-1 text-sm text-gray-500">
              Total hasil ditampilkan: {filteredVendors.length}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Mengambil data vendor...
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Data vendor tidak ditemukan.
            </div>
          ) : (
            <>
              {/* MOBILE & TABLET CARD */}
              <div className="grid gap-4 p-4 xl:hidden">
                {filteredVendors.map((vendor, index) => {
                  const isActive = getIsActive(vendor);
                  const logoSrc = getLogo(vendor);

                  return (
                    <div
                      key={vendor.id}
                      className="rounded-3xl border border-[#7f1d1d]/10 bg-[#fffafa] p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={getCanteenName(vendor)}
                            className="h-14 w-14 shrink-0 rounded-2xl border border-[#7f1d1d]/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-sm font-black text-[#7f1d1d]">
                            K
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#7f1d1d]/10 px-3 py-1 text-xs font-black text-[#7f1d1d]">
                              #{index + 1}
                            </span>

                            <Badge
                              className={
                                isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : "bg-red-100 text-[#7f1d1d] hover:bg-red-100"
                              }
                            >
                              {isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>

                          <h3 className="truncate text-base font-black text-gray-950">
                            {getVendorName(vendor)}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-sm font-semibold text-gray-500">
                            {getCanteenName(vendor)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm">
                        <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
                          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#7f1d1d]" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-400">
                              Email
                            </p>
                            <p className="break-all font-semibold text-gray-700">
                              {getVendorEmail(vendor)}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
                            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#7f1d1d]" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-400">
                                WhatsApp
                              </p>
                              <p className="break-all font-semibold text-gray-700">
                                {getVendorWhatsapp(vendor)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-2xl bg-white p-3">
                            <Hash className="mt-0.5 h-4 w-4 shrink-0 text-[#7f1d1d]" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-400">
                                No Kantin
                              </p>
                              <p className="font-semibold text-gray-700">
                                {getCanteenNumber(vendor)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <EditVendor
                          selectedData={vendor}
                          baseApiUrl={BASE_API_URL}
                          onSuccess={fetchVendors}
                        />

                        <ResetPasswordVendor
                          selectedData={vendor}
                          baseApiUrl={BASE_API_URL}
                          onSuccess={fetchVendors}
                        />

                        <StatusVendor
                          selectedData={vendor}
                          baseApiUrl={BASE_API_URL}
                          onSuccess={fetchVendors}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden w-full overflow-x-auto xl:block">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="bg-[#fff7f7] hover:bg-[#fff7f7]">
                      <TableHead className="w-[60px] font-black text-[#7f1d1d]">
                        No
                      </TableHead>

                      <TableHead className="w-[80px] font-black text-[#7f1d1d]">
                        Logo
                      </TableHead>

                      <TableHead className="font-black text-[#7f1d1d]">
                        Nama Pemilik
                      </TableHead>

                      <TableHead className="font-black text-[#7f1d1d]">
                        Email
                      </TableHead>

                      <TableHead className="font-black text-[#7f1d1d]">
                        WhatsApp
                      </TableHead>

                      <TableHead className="font-black text-[#7f1d1d]">
                        No Kantin
                      </TableHead>

                      <TableHead className="font-black text-[#7f1d1d]">
                        Nama Kantin
                      </TableHead>

                      <TableHead className="font-black text-[#7f1d1d]">
                        Status
                      </TableHead>

                      <TableHead className="text-center font-black text-[#7f1d1d]">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredVendors.map((vendor, index) => {
                      const isActive = getIsActive(vendor);
                      const logoSrc = getLogo(vendor);

                      return (
                        <TableRow
                          key={vendor.id}
                          className="border-[#7f1d1d]/10 hover:bg-[#fff7f7]"
                        >
                          <TableCell className="font-semibold">
                            {index + 1}
                          </TableCell>

                          <TableCell>
                            {logoSrc ? (
                              <img
                                src={logoSrc}
                                alt={getCanteenName(vendor)}
                                className="h-11 w-11 rounded-2xl border border-[#7f1d1d]/10 object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-xs font-black text-[#7f1d1d]">
                                K
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="max-w-[170px] font-black text-gray-950">
                            <p className="truncate">{getVendorName(vendor)}</p>
                          </TableCell>

                          <TableCell className="max-w-[220px] font-medium text-gray-600">
                            <p className="truncate">{getVendorEmail(vendor)}</p>
                          </TableCell>

                          <TableCell className="font-medium text-gray-600">
                            {getVendorWhatsapp(vendor)}
                          </TableCell>

                          <TableCell className="font-medium text-gray-600">
                            {getCanteenNumber(vendor)}
                          </TableCell>

                          <TableCell className="max-w-[180px] font-medium text-gray-600">
                            <p className="truncate">
                              {getCanteenName(vendor)}
                            </p>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={
                                isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                                  : "bg-red-100 text-[#7f1d1d] hover:bg-red-100"
                              }
                            >
                              {isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <EditVendor
                                selectedData={vendor}
                                baseApiUrl={BASE_API_URL}
                                onSuccess={fetchVendors}
                              />

                              <ResetPasswordVendor
                                selectedData={vendor}
                                baseApiUrl={BASE_API_URL}
                                onSuccess={fetchVendors}
                              />

                              <StatusVendor
                                selectedData={vendor}
                                baseApiUrl={BASE_API_URL}
                                onSuccess={fetchVendors}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}