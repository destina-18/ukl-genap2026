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
} from "lucide-react";

type MenuItem = {
  id: number;
  name: string;
  price?: number;
  status?: string;
  is_available?: boolean;
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
};

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

      const token = getCookie("accessToken");

      const menuRes = await fetch(`${BASE_API_URL}/api/vendor/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const orderRes = await fetch(`${BASE_API_URL}/api/vendor/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenus(menuData.data || menuData.menus || menuData || []);
      }

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.data || orderData.orders || orderData || []);
      }
    } catch (error) {
      console.error("Gagal mengambil data vendor:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendorData();
  }, []);

  const totalMenu = menus.length;

  const activeMenu = menus.filter((menu) => {
    return menu.status === "active" || menu.is_available === true;
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
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Store size={24} />
              </div>

              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Vendor Dashboard
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Kelola menu makanan, pantau pesanan, dan lihat pendapatan kantin.
              </p>
            </div>

            <Link
              href="/vendor/menus/add"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <Plus size={18} />
              Tambah Menu
            </Link>
          </div>
        </div>

        {/* STAT CARD */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Utensils size={22} />
            </div>

            <p className="text-sm text-gray-500">Total Menu</p>

            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : totalMenu}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <ShoppingBag size={22} />
            </div>

            <p className="text-sm text-gray-500">Menu Aktif</p>

            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : activeMenu}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <Clock size={22} />
            </div>

            <p className="text-sm text-gray-500">Pesanan Masuk</p>

            <h2 className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : pendingOrders}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Wallet size={22} />
            </div>

            <p className="text-sm text-gray-500">Pendapatan</p>

            <h2 className="mt-2 text-2xl font-bold text-gray-800">
              {loading ? "..." : formatRupiah(totalIncome)}
            </h2>
          </div>
        </div>

        {/* QUICK ACTION */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/vendor/menus"
            className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Kelola Menu</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Tambah, edit, dan aktifkan menu.
                </p>
              </div>

              <ArrowRight
                size={20}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-red-600"
              />
            </div>
          </Link>

          <Link
            href="/vendor/orders"
            className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Pesanan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Lihat dan proses pesanan customer.
                </p>
              </div>

              <ArrowRight
                size={20}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-red-600"
              />
            </div>
          </Link>

          <Link
            href="/vendor/profile"
            className="group rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800">Profil Vendor</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Atur informasi kantin kamu.
                </p>
              </div>

              <ArrowRight
                size={20}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-red-600"
              />
            </div>
          </Link>
        </div>

        {/* LATEST ORDER */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                Pesanan Terbaru
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Daftar pesanan customer yang baru masuk.
              </p>
            </div>

            <Link
              href="/vendor/orders"
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Lihat semua
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Mengambil data...
            </div>
          ) : latestOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada pesanan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm text-gray-600">
                    <th className="p-4">No</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tanggal</th>
                  </tr>
                </thead>

                <tbody>
                  {latestOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="border-t text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <td className="p-4">{index + 1}</td>

                      <td className="p-4 font-semibold">
                        {order.customer_name || order.customer?.name || "-"}
                      </td>

                      <td className="p-4">
                        {formatRupiah(
                          Number(order.total_price || order.total || 0)
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === "completed" ||
                            order.status === "done" ||
                            order.status === "paid"
                              ? "bg-green-100 text-green-600"
                              : order.status === "cancelled" ||
                                  order.status === "canceled"
                                ? "bg-red-100 text-red-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {order.status || "pending"}
                        </span>
                      </td>

                      <td className="p-4">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}