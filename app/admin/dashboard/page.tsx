"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Store,
  Users,
  RefreshCcw,
  Utensils,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

type Vendor = {
  [key: string]: any;
};

type Customer = {
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

  if (Array.isArray(response?.vendors)) return response.vendors;
  if (Array.isArray(response?.data?.vendors)) return response.data.vendors;

  if (Array.isArray(response?.customers)) return response.customers;
  if (Array.isArray(response?.data?.customers)) return response.data.customers;

  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.data?.users)) return response.data.users;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.result)) return response.data.result;

  return [];
}

function getMenuCountFromVendors(vendors: Vendor[]) {
  return vendors.reduce((total, vendor) => {
    const countMenus =
      vendor?._count?.menus ??
      vendor?._count?.Menus ??
      vendor?.menuCount ??
      vendor?.menusCount ??
      vendor?.totalMenu ??
      vendor?.totalMenus ??
      vendor?.total_menu ??
      vendor?.total_menus ??
      (Array.isArray(vendor?.menus) ? vendor.menus.length : 0) ??
      (Array.isArray(vendor?.Menus) ? vendor.Menus.length : 0);

    return total + Number(countMenus || 0);
  }, 0);
}

export default function AdminDashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalMenus, setTotalMenus] = useState(0);
  const [loading, setLoading] = useState(true);

  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL ||
    "https://kantinklik.up.railway.app";

  async function getDashboardData() {
    try {
      setLoading(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        console.log("TOKEN TIDAK ADA");
        setVendors([]);
        setCustomers([]);
        setTotalMenus(0);
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      // =========================
      // AMBIL TOTAL VENDOR + TOTAL MENU DARI DATA VENDOR
      // =========================
      const vendorResponse = await fetch(`${BASE_API_URL}/api/vendors`, {
        method: "GET",
        headers,
        cache: "no-store",
      });

      const vendorResult = await vendorResponse.json().catch(() => null);
      console.log("DASHBOARD VENDOR RESPONSE:", vendorResult);

      if (vendorResponse.ok) {
        const vendorArray = getArrayFromResponse(vendorResult);

        setVendors(vendorArray);

        const menuCount = getMenuCountFromVendors(vendorArray);
        setTotalMenus(menuCount);

        console.log("TOTAL MENU DARI DATA VENDOR:", menuCount);
        console.log("VENDOR ARRAY:", vendorArray);
      } else {
        console.log("GAGAL AMBIL VENDOR:", vendorResult);
        setVendors([]);
        setTotalMenus(0);
      }

      // =========================
      // AMBIL TOTAL CUSTOMER
      // =========================
      const customerResponse = await fetch(
        `${BASE_API_URL}/api/admin/customers`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const customerResult = await customerResponse.json().catch(() => null);
      console.log("DASHBOARD CUSTOMER RESPONSE:", customerResult);

      if (customerResponse.ok) {
        setCustomers(getArrayFromResponse(customerResult));
      } else {
        console.log("GAGAL AMBIL CUSTOMER:", customerResult);
        setCustomers([]);
      }
    } catch (error) {
      console.error("ERROR DASHBOARD:", error);
      setVendors([]);
      setCustomers([]);
      setTotalMenus(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[120px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Admin Panel
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Dashboard Admin
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Ringkasan data KantinKlik untuk memantau vendor, customer, dan
                menu.
              </p>
            </div>

            <button
              type="button"
              onClick={getDashboardData}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Store size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Total Vendor</p>

            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : vendors.length}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Users size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">
              Total Customer
            </p>

            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : customers.length}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Utensils size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Total Menu</p>

            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : totalMenus}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/admin/customers"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Users size={25} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-gray-950">
                Kelola Customer
              </h3>
              <ArrowRight className="h-5 w-5 text-[#7f1d1d] transition group-hover:translate-x-1" />
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Lihat daftar customer yang sudah terdaftar di KantinKlik.
            </p>
          </Link>

          <Link
            href="/admin/vendors"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Store size={25} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-gray-950">
                Kelola Vendor
              </h3>
              <ArrowRight className="h-5 w-5 text-[#7f1d1d] transition group-hover:translate-x-1" />
            </div>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Kelola data vendor kantin, status aktif, dan informasi vendor.
            </p>
          </Link>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
            <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Utensils size={25} />
            </div>

            <h3 className="text-lg font-black text-gray-950">Data Menu</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Total menu dihitung dari data vendor yang dikirim oleh backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}