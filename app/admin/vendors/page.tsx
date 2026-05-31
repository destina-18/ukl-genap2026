"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Search, Store } from "lucide-react";

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
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Store className="h-4 w-4" />
                Vendor Management
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Data Vendor
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Kelola akun vendor kantin, data pemilik, nomor kantin, logo,
                reset password, dan status aktif vendor.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchVendors}
                disabled={loading}
                className="flex w-fit items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <AddVendor baseApiUrl={BASE_API_URL} onSuccess={fetchVendors} />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Total Vendor</p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : vendors.length}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Vendor Aktif</p>
            <h2 className="mt-2 text-4xl font-black text-green-700">
              {loading ? "..." : activeVendors}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">
              Vendor Nonaktif
            </p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : inactiveVendors}
            </h2>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mb-5 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-4 shadow-lg shadow-red-900/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f1d1d]" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, WhatsApp, atau nama kantin..."
              className="h-12 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] pl-11 font-medium focus-visible:ring-[#7f1d1d]"
            />
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
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
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#fff7f7] hover:bg-[#fff7f7]">
                    <TableHead className="font-black text-[#7f1d1d]">
                      No
                    </TableHead>

                    <TableHead className="font-black text-[#7f1d1d]">
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

                        <TableCell className="font-black text-gray-950">
                          {getVendorName(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getVendorEmail(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getVendorWhatsapp(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getCanteenNumber(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getCanteenName(vendor)}
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
          )}
        </section>
      </div>
    </main>
  );
}