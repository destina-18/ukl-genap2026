"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock,
  Plus,
  ShoppingBag,
  Store,
  Utensils,
  Wallet,
  RefreshCcw,
} from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  price?: number;
  status?: string;
  is_available?: boolean;
  isAvailable?: boolean;
};

type OrderItem = {
  id: number;
  customer_name?: string;
  customer?: {
    name?: string;
  };
  total_price?: number;
  total?: number;
  status?: string;
  created_at?: string;
  createdAt?: string;
};

function getArrayFromResponse(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.menus)) return response.menus;
  if (Array.isArray(response?.data?.menus)) return response.data.menus;
  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.data?.orders)) return response.data.orders;
  if (Array.isArray(response?.items)) return response.items;

  return [];
}

export default function VendorDashboardPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

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
    return getCookie("accessToken") || getCookie("accesstoken");
  }

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

  async function fetchVendorData() {
    try {
      setLoading(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const menuRes = await fetch(`${BASE_API_URL}/api/vendor/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenus(getArrayFromResponse(menuData));
      } else {
        setMenus([]);
      }

      try {
        const orderRes = await fetch(`${BASE_API_URL}/api/vendor/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(getArrayFromResponse(orderData));
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data vendor:", error);
      setMenus([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendorData();
  }, []);

  const totalMenu = menus.length;

  const activeMenu = menus.filter((menu) => {
    return (
      menu.status === "active" ||
      menu.status === "available" ||
      menu.is_available === true ||
      menu.isAvailable === true
    );
  }).length;

  const pendingOrders = orders.filter((order) => {
    return (
      order.status === "pending" ||
      order.status === "waiting" ||
      order.status === "process"
    );
  }).length;

  const totalIncome = orders
    .filter((order) => {
      return (
        order.status === "completed" ||
        order.status === "done" ||
        order.status === "paid"
      );
    })
    .reduce((total, order) => {
      return total + Number(order.total_price || order.total || 0);
    }, 0);

  const latestOrders = orders.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[120px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
      </div>

      <section className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Store className="h-4 w-4" />
                Vendor Panel
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Vendor Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Kelola menu makanan, pantau pesanan, dan lihat ringkasan data
                kantin kamu.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchVendorData}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <Link
                href="/vendor/menus"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105"
              >
                <Plus size={18} />
                Tambah Menu
              </Link>
            </div>
          </div>
        </div>

        {/* STAT CARD */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Utensils size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Total Menu</p>

            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : totalMenu}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ShoppingBag size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Menu Aktif</p>

            <h2 className="mt-2 text-4xl font-black text-green-700">
              {loading ? "..." : activeMenu}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Clock size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">
              Pesanan Masuk
            </p>

            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : pendingOrders}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Wallet size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Pendapatan</p>

            <h2 className="mt-2 text-2xl font-black text-[#7f1d1d]">
              {loading ? "..." : formatRupiah(totalIncome)}
            </h2>
          </div>
        </div>

        {/* QUICK ACTION */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/vendor/menus"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-950">
                  Kelola Menu
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Tambah, edit, dan aktifkan menu makanan.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="text-[#7f1d1d] transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            href="/vendor/orders"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-950">Pesanan</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Lihat dan proses pesanan customer.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="text-[#7f1d1d] transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            href="/vendor/profile"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-950">
                  Profil Vendor
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Atur informasi kantin kamu.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="text-[#7f1d1d] transition group-hover:translate-x-1"
              />
            </div>
          </Link>
        </div>

        {/* LATEST ORDER */}
        <div className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
          <div className="flex items-center justify-between border-b border-[#7f1d1d]/10 bg-white p-5">
            <div>
              <h2 className="text-lg font-black text-gray-950">
                Pesanan Terbaru
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daftar pesanan customer yang baru masuk.
              </p>
            </div>

            <Link
              href="/vendor/orders"
              className="text-sm font-black text-[#7f1d1d] transition hover:text-[#450a0a]"
            >
              Lihat semua
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Mengambil data...
            </div>
          ) : latestOrders.length === 0 ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Belum ada pesanan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-[#fff7f7] text-left text-sm">
                    <th className="p-4 font-black text-[#7f1d1d]">No</th>
                    <th className="p-4 font-black text-[#7f1d1d]">
                      Customer
                    </th>
                    <th className="p-4 font-black text-[#7f1d1d]">Total</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Status</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Tanggal</th>
                  </tr>
                </thead>

                <tbody>
                  {latestOrders.map((order, index) => {
                    const orderDate = order.created_at || order.createdAt;

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-[#7f1d1d]/10 text-sm text-gray-700 hover:bg-[#fff7f7]"
                      >
                        <td className="p-4 font-semibold">{index + 1}</td>

                        <td className="p-4 font-black text-gray-950">
                          {order.customer_name || order.customer?.name || "-"}
                        </td>

                        <td className="p-4 font-medium">
                          {formatRupiah(
                            Number(order.total_price || order.total || 0)
                          )}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${
                              order.status === "completed" ||
                              order.status === "done" ||
                              order.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : order.status === "cancelled" ||
                                    order.status === "canceled"
                                  ? "bg-red-100 text-[#7f1d1d]"
                                  : "bg-[#fff0f0] text-[#7f1d1d]"
                            }`}
                          >
                            {order.status || "pending"}
                          </span>
                        </td>

                        <td className="p-4 font-medium">
                          {orderDate
                            ? new Date(orderDate).toLocaleDateString("id-ID")
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}