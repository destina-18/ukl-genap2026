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
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

type MenuItem = {
  id: number | string;
  name?: string;
  price?: number;
  status?: string;
  is_available?: boolean;
  isAvailable?: boolean;
  stock?: number;
};

type OrderDetail = {
  id?: number | string;
  quantity?: number | string;
  qty?: number | string;

  price?: number | string;
  menuPrice?: number | string;
  menu_price?: number | string;
  unitPrice?: number | string;
  unit_price?: number | string;

  subtotal?: number | string;
  subTotal?: number | string;
  sub_total?: number | string;
  total?: number | string;
  totalPrice?: number | string;
  total_price?: number | string;

  menu?: {
    name?: string;
    price?: number | string;
  };

  [key: string]: any;
};

type OrderItem = {
  id: number | string;

  customer_name?: string;
  customerName?: string;
  customer?: {
    name?: string;
  };

  total_price?: number | string;
  totalPrice?: number | string;
  total_amount?: number | string;
  totalAmount?: number | string;
  grand_total?: number | string;
  grandTotal?: number | string;
  total?: number | string;

  status?: string;
  created_at?: string;
  createdAt?: string;
  paymentMethod?: string;
  payment_method?: string;

  items?: OrderDetail[];
  orderItems?: OrderDetail[];
  order_items?: OrderDetail[];
  details?: OrderDetail[];
  orderDetails?: OrderDetail[];
  order_details?: OrderDetail[];

  [key: string]: any;
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
  if (Array.isArray(response?.data?.items)) return response.data.items;

  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.result)) return response.data.result;

  return [];
}

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
  if (typeof window === "undefined") return "";

  return (
    getCookie("accessToken") ||
    getCookie("token") ||
    getCookie("accesstoken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

function formatRupiah(value: number | string | undefined | null) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
}

function getOrderItems(order: OrderItem) {
  return (
    order.items ||
    order.orderItems ||
    order.order_items ||
    order.details ||
    order.orderDetails ||
    order.order_details ||
    []
  );
}

function getItemQuantity(item: OrderDetail) {
  return Number(item.quantity || item.qty || 1);
}

function getItemPrice(item: OrderDetail) {
  return Number(
    item.price ||
      item.menuPrice ||
      item.menu_price ||
      item.unitPrice ||
      item.unit_price ||
      item.menu?.price ||
      0
  );
}

function getItemSubtotal(item: OrderDetail) {
  const quantity = getItemQuantity(item);
  const price = getItemPrice(item);

  return Number(
    item.subtotal ||
      item.subTotal ||
      item.sub_total ||
      item.totalPrice ||
      item.total_price ||
      item.total ||
      price * quantity ||
      0
  );
}

function getOrderTotal(order: OrderItem) {
  const items = getOrderItems(order);

  const totalFromItems = items.reduce((sum, item) => {
    return sum + getItemSubtotal(item);
  }, 0);

  return Number(
    order.total_price ||
      order.totalPrice ||
      order.total_amount ||
      order.totalAmount ||
      order.grand_total ||
      order.grandTotal ||
      order.total ||
      totalFromItems ||
      0
  );
}

function getOrderStatus(order: OrderItem) {
  return String(order.status || "PENDING").toUpperCase();
}

function getCustomerName(order: OrderItem) {
  return (
    order.customer_name ||
    order.customerName ||
    order.customer?.name ||
    "-"
  );
}

function getStatusBadgeClass(status: string) {
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  if (status === "READY") return "bg-purple-100 text-purple-700";
  if (status === "ACCEPTED") return "bg-blue-100 text-blue-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  if (status === "CANCELLED" || status === "CANCELED")
    return "bg-red-100 text-red-700";

  return "bg-yellow-100 text-yellow-700";
}

export default function VendorDashboardPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  async function fetchVendorData() {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        window.location.href = "/sign-in";
        return;
      }

      const menuRes = await fetch(`${BASE_API_URL}/api/vendor/menus`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const menuData = await menuRes.json().catch(() => null);

      console.log("VENDOR MENUS STATUS:", menuRes.status);
      console.log("VENDOR MENUS RESPONSE:", menuData);

      if (menuRes.ok) {
        setMenus(getArrayFromResponse(menuData));
      } else {
        console.log("GAGAL AMBIL MENU VENDOR:", menuData);
        setMenus([]);
      }

      const orderRes = await fetch(`${BASE_API_URL}/api/vendor/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const orderData = await orderRes.json().catch(() => null);

      console.log("VENDOR ORDERS STATUS:", orderRes.status);
      console.log("VENDOR ORDERS RESPONSE:", orderData);

      if (orderRes.ok) {
        setOrders(getArrayFromResponse(orderData));
      } else {
        console.log("GAGAL AMBIL ORDER VENDOR:", orderData);
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
    const status = String(menu.status || "").toUpperCase();

    return (
      status === "ACTIVE" ||
      status === "AVAILABLE" ||
      menu.is_available === true ||
      menu.isAvailable === true
    );
  }).length;

  const pendingOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    return status === "PENDING";
  }).length;

  const acceptedOrders = orders.filter((order) => {
    const status = getOrderStatus(order);
    return status === "ACCEPTED" || status === "READY";
  }).length;

  const totalIncome = orders
    .filter((order) => getOrderStatus(order) === "COMPLETED")
    .reduce((total, order) => total + getOrderTotal(order), 0);

  const latestOrders = [...orders].slice(0, 5);

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[120px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
      </div>

      <section className="mx-auto max-w-7xl">
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
                href="/vendor/menu"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105"
              >
                <Plus size={18} />
                Tambah Menu
              </Link>
            </div>
          </div>
        </div>

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
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
              <Clock size={23} />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Pesanan Pending
            </p>
            <h2 className="mt-2 text-4xl font-black text-yellow-700">
              {loading ? "..." : pendingOrders}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <CheckCircle2 size={23} />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Diproses/Ready
            </p>
            <h2 className="mt-2 text-4xl font-black text-blue-700">
              {loading ? "..." : acceptedOrders}
            </h2>
          </div>
        </div>

        <div className="mb-8 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Pendapatan dari order selesai
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#7f1d1d]">
                {loading ? "..." : formatRupiah(totalIncome)}
              </h2>
            </div>

            <Link
              href="/vendor/orders"
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b]"
            >
              Lihat Pesanan
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            href="/vendor/menu"
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
                    const status = getOrderStatus(order);

                    return (
                      <tr
                        key={String(order.id)}
                        className="border-t border-[#7f1d1d]/10 text-sm text-gray-700 hover:bg-[#fff7f7]"
                      >
                        <td className="p-4 font-semibold">{index + 1}</td>

                        <td className="p-4 font-black text-gray-950">
                          {getCustomerName(order)}
                        </td>

                        <td className="p-4 font-medium">
                          {formatRupiah(getOrderTotal(order))}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadgeClass(
                              status
                            )}`}
                          >
                            {status}
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