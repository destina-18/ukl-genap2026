"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Users, RefreshCcw, ShoppingBag, Utensils } from "lucide-react";

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

  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.items)) return response.items;

  return [];
}

export default function AdminDashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  async function getDashboardData() {
    try {
      setLoading(true);

      const token = getCookie("accessToken");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const vendorResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/vendors`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      const vendorResult = await vendorResponse.json();

      console.log("DASHBOARD VENDOR RESPONSE:", vendorResult);

      if (vendorResponse.ok) {
        const vendorArray = getArrayFromResponse(vendorResult);
        setVendors(vendorArray);
      } else {
        console.log("GAGAL AMBIL VENDOR:", vendorResult);
        setVendors([]);
      }

      try {
        const customerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL}/api/customers`,
          {
            method: "GET",
            headers,
            cache: "no-store",
          }
        );

        const customerResult = await customerResponse.json();

        console.log("DASHBOARD CUSTOMER RESPONSE:", customerResult);

        if (customerResponse.ok) {
          const customerArray = getArrayFromResponse(customerResult);
          setCustomers(customerArray);
        } else {
          console.log("GAGAL AMBIL CUSTOMER:", customerResult);
          setCustomers([]);
        }
      } catch (error) {
        console.log("CUSTOMER ENDPOINT ERROR:", error);
        setCustomers([]);
      }
    } catch (error) {
      console.error("ERROR DASHBOARD:", error);
      setVendors([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F7EF] p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#283618] md:text-3xl">
              Dashboard Admin
            </h1>
            <p className="mt-1 text-sm text-[#6B705C]">
              Ringkasan data KantinKlik.
            </p>
          </div>

          <button
            onClick={getDashboardData}
            className="flex w-fit items-center gap-2 rounded-xl bg-[#283618] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2a12]"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDE5B6] text-[#283618]">
              <Store size={22} />
            </div>
            <p className="text-sm text-[#6B705C]">Total Vendor</p>
            <h2 className="mt-2 text-3xl font-bold text-[#283618]">
              {loading ? "..." : vendors.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users size={22} />
            </div>
            <p className="text-sm text-[#6B705C]">Total Customer</p>
            <h2 className="mt-2 text-3xl font-bold text-[#283618]">
              {loading ? "..." : customers.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Utensils size={22} />
            </div>
            <p className="text-sm text-[#6B705C]">Total Menu</p>
            <h2 className="mt-2 text-3xl font-bold text-[#283618]">0</h2>
          </div>

          <div className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <ShoppingBag size={22} />
            </div>
            <p className="text-sm text-[#6B705C]">Total Order</p>
            <h2 className="mt-2 text-3xl font-bold text-[#283618]">0</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/admin/customers"
            className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#283618]">
              Kelola Customer
            </h3>
            <p className="mt-1 text-sm text-[#6B705C]">
              Lihat daftar customer yang sudah terdaftar.
            </p>
          </Link>

          <div className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <Utensils size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#283618]">Menu</h3>
            <p className="mt-1 text-sm text-[#6B705C]">
              Data menu belum disambungkan.
            </p>
          </div>

          <div className="rounded-2xl border border-[#DDE5B6] bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#283618]">Order</h3>
            <p className="mt-1 text-sm text-[#6B705C]">
              Data order belum disambungkan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}