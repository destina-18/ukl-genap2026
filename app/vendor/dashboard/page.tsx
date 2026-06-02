"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCcw,
  ShoppingBag,
  Store,
  Utensils,
} from "lucide-react";

type MenuItem = {
  id: number | string;
  name?: string;
  price?: number | string;
  status?: string;
  is_available?: boolean;
  isAvailable?: boolean;
  stock?: number | string;
};

type OrderDetail = {
  id?: number | string;
  quantity?: number | string;
  qty?: number | string;
  amount?: number | string;
  totalQuantity?: number | string;
  total_quantity?: number | string;

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

  product?: {
    name?: string;
    price?: number | string;
  };

  [key: string]: any;
};

type OrderItem = {
  id: number | string;
  orderId?: number | string;

  customer_name?: string;
  customerName?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };

  total_price?: number | string;
  totalPrice?: number | string;
  total_amount?: number | string;
  totalAmount?: number | string;
  grand_total?: number | string;
  grandTotal?: number | string;
  final_price?: number | string;
  finalPrice?: number | string;
  amount?: number | string;
  price?: number | string;
  total?: number | string;

  status?: string;
  created_at?: string;
  createdAt?: string;

  items?: OrderDetail[];
  orderItems?: OrderDetail[];
  order_items?: OrderDetail[];
  details?: OrderDetail[];
  orderDetails?: OrderDetail[];
  order_details?: OrderDetail[];
  menuItems?: OrderDetail[];
  menu_items?: OrderDetail[];

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
    order.menuItems ||
    order.menu_items ||
    []
  );
}

function getOrderTotal(order: OrderItem) {
  const directTotal = Number(
    order.total_price ||
      order.totalPrice ||
      order.total_amount ||
      order.totalAmount ||
      order.grand_total ||
      order.grandTotal ||
      order.final_price ||
      order.finalPrice ||
      order.amount ||
      order.price ||
      order.total ||
      0
  );

  if (directTotal > 0) return directTotal;

  const possibleItems = getOrderItems(order);

  if (Array.isArray(possibleItems) && possibleItems.length > 0) {
    const totalFromItems = possibleItems.reduce((sum, item) => {
      const quantity = Number(
        item.quantity ||
          item.qty ||
          item.amount ||
          item.totalQuantity ||
          item.total_quantity ||
          1
      );

      const price = Number(
        item.price ||
          item.menuPrice ||
          item.menu_price ||
          item.unitPrice ||
          item.unit_price ||
          item.menu?.price ||
          item.product?.price ||
          0
      );

      const subtotal = Number(
        item.subtotal ||
          item.subTotal ||
          item.sub_total ||
          item.totalPrice ||
          item.total_price ||
          item.total ||
          0
      );

      if (subtotal > 0) return sum + subtotal;

      return sum + price * quantity;
    }, 0);

    if (totalFromItems > 0) return totalFromItems;
  }

  console.log("ORDER TOTAL TIDAK KEBACA:", order);
  return 0;
}

function getOrderStatus(order: OrderItem) {
  return String(order.status || "PENDING").toUpperCase();
}

function isIncomeOrder(order: OrderItem) {
  const status = getOrderStatus(order);

  return (
    status !== "REJECTED" &&
    status !== "CANCELLED" &&
    status !== "CANCELED" &&
    status !== "FAILED"
  );
}

function isCompletedOrder(order: OrderItem) {
  const status = getOrderStatus(order);

  return (
    status === "COMPLETED" ||
    status === "COMPLETE" ||
    status === "DONE" ||
    status === "FINISHED" ||
    status === "SELESAI"
  );
}

function getCustomerName(order: OrderItem) {
  return (
    order.customer_name ||
    order.customerName ||
    order.customer?.name ||
    order.user?.name ||
    "-"
  );
}

function getStatusBadgeClass(status: string) {
  if (
    status === "COMPLETED" ||
    status === "COMPLETE" ||
    status === "DONE" ||
    status === "FINISHED" ||
    status === "SELESAI"
  ) {
    return "bg-green-100 text-green-700";
  }

  if (status === "READY") return "bg-purple-100 text-purple-700";

  if (
    status === "ACCEPTED" ||
    status === "PROCESS" ||
    status === "PROCESSING" ||
    status === "ON_PROCESS"
  ) {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "REJECTED") return "bg-red-100 text-red-700";

  if (status === "CANCELLED" || status === "CANCELED" || status === "FAILED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
}

function formatDate(date?: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
        const orderList = getArrayFromResponse(orderData);

        console.log("ORDER LIST YANG DIPAKAI DASHBOARD:", orderList);

        setOrders(orderList);
      } else {
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

    return (
      status === "ACCEPTED" ||
      status === "READY" ||
      status === "PROCESS" ||
      status === "ON_PROCESS" ||
      status === "PROCESSING"
    );
  }).length;

  const completedOrders = orders.filter((order) =>
    isCompletedOrder(order)
  ).length;

  const totalIncome = orders
    .filter((order) => isIncomeOrder(order))
    .reduce((total, order) => total + getOrderTotal(order), 0);

  const latestOrders = [...orders].slice(0, 5);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff7f7] px-3 py-4 text-gray-900 sm:px-5 md:px-8 md:py-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-160px] top-[-160px] h-[320px] w-[320px] rounded-full bg-[#7f1d1d]/20 blur-3xl md:h-[420px] md:w-[420px]" />
        <div className="absolute right-[-180px] top-[120px] h-[340px] w-[340px] rounded-full bg-[#991b1b]/20 blur-3xl md:h-[480px] md:w-[480px]" />
      </div>

      <section className="mx-auto w-full max-w-7xl">
        {/* HERO */}
        <div className="mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-5 text-white shadow-2xl shadow-red-900/20 sm:p-6 md:mb-8 md:rounded-[2rem] md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-red-50 backdrop-blur sm:text-sm">
                <Store className="h-4 w-4 shrink-0" />
                Vendor Panel
              </div>

              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                Vendor Dashboard
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Kelola menu makanan, pantau pesanan, dan lihat ringkasan data
                kantin kamu.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
              <button
                onClick={fetchVendorData}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <Link
                href="/vendor/menu"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-[1.02] lg:w-auto"
              >
                <Plus size={18} />
                Tambah Menu
              </Link>
            </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:mb-8 xl:grid-cols-5">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <Utensils size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Total Menu</p>

            <h2 className="mt-2 text-3xl font-black text-[#7f1d1d] sm:text-4xl">
              {loading ? "..." : totalMenu}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ShoppingBag size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">Menu Aktif</p>

            <h2 className="mt-2 text-3xl font-black text-green-700 sm:text-4xl">
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

            <h2 className="mt-2 text-3xl font-black text-yellow-700 sm:text-4xl">
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

            <h2 className="mt-2 text-3xl font-black text-blue-700 sm:text-4xl">
              {loading ? "..." : acceptedOrders}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 sm:col-span-2 xl:col-span-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <CheckCircle2 size={23} />
            </div>

            <p className="text-sm font-semibold text-gray-500">
              Order Selesai
            </p>

            <h2 className="mt-2 text-3xl font-black text-green-700 sm:text-4xl">
              {loading ? "..." : completedOrders}
            </h2>
          </div>
        </div>

        {/* INCOME */}
        <div className="mb-5 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 md:mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-500">
                Pendapatan dari order masuk
              </p>

              <h2 className="mt-2 break-words text-2xl font-black text-[#7f1d1d] sm:text-3xl">
                {loading ? "..." : formatRupiah(totalIncome)}
              </h2>

              <p className="mt-2 text-xs font-semibold leading-5 text-gray-400">
                Dihitung dari semua order vendor kecuali yang ditolak,
                dibatalkan, atau gagal.
              </p>
            </div>

            <Link
              href="/vendor/orders"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b] md:w-fit"
            >
              Lihat Pesanan
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* QUICK MENU */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:mb-8 md:grid-cols-3">
          <Link
            href="/vendor/menu"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-gray-950">
                  Kelola Menu
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Tambah, edit, dan aktifkan menu makanan.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="shrink-0 text-[#7f1d1d] transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            href="/vendor/orders"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-gray-950">Pesanan</h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Lihat dan proses pesanan customer.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="shrink-0 text-[#7f1d1d] transition group-hover:translate-x-1"
              />
            </div>
          </Link>

          <Link
            href="/vendor/profile"
            className="group rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-black text-gray-950">
                  Profil Vendor
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Atur informasi akun vendor kamu.
                </p>
              </div>

              <ArrowRight
                size={22}
                className="shrink-0 text-[#7f1d1d] transition group-hover:translate-x-1"
              />
            </div>
          </Link>
        </div>

        {/* LATEST ORDERS */}
        <div className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
          <div className="flex flex-col gap-3 border-b border-[#7f1d1d]/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
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
              className="w-fit text-sm font-black text-[#7f1d1d] hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm font-semibold text-gray-500">
              Mengambil pesanan...
            </div>
          ) : latestOrders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff7f7] text-[#7f1d1d]">
                <ShoppingBag size={30} />
              </div>

              <h3 className="text-lg font-black text-gray-950">
                Belum ada pesanan
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Pesanan customer akan muncul di sini.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE CARD */}
              <div className="grid gap-3 p-4 md:hidden">
                {latestOrders.map((order, index) => {
                  const status = getOrderStatus(order);
                  const total = getOrderTotal(order);

                  return (
                    <div
                      key={String(order.id || order.orderId || index)}
                      className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fffafa] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-black text-gray-900">
                            {getCustomerName(order)}
                          </p>

                          <p className="mt-1 text-xs font-semibold text-gray-400">
                            Order #{order.id || order.orderId || "-"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black ${getStatusBadgeClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-gray-500">
                            Tanggal
                          </span>
                          <span className="text-right font-bold text-gray-700">
                            {formatDate(order.createdAt || order.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-gray-500">
                            Total
                          </span>
                          <span className="text-right font-black text-[#7f1d1d]">
                            {formatRupiah(total)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/vendor/orders"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7f1d1d] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#991b1b]"
                      >
                        Detail
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-[#7f1d1d]/10 bg-[#fff7f7] text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-4">Customer</th>
                      <th className="px-5 py-4">Tanggal</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {latestOrders.map((order, index) => {
                      const status = getOrderStatus(order);
                      const total = getOrderTotal(order);

                      return (
                        <tr
                          key={String(order.id || order.orderId || index)}
                          className="border-b border-[#7f1d1d]/10 text-sm last:border-b-0"
                        >
                          <td className="px-5 py-4">
                            <p className="font-black text-gray-900">
                              {getCustomerName(order)}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-gray-400">
                              Order #{order.id || order.orderId || "-"}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-semibold text-gray-600">
                            {formatDate(order.createdAt || order.created_at)}
                          </td>

                          <td className="px-5 py-4 font-black text-[#7f1d1d]">
                            {formatRupiah(total)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-black ${getStatusBadgeClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href="/vendor/orders"
                              className="inline-flex items-center gap-2 rounded-xl bg-[#7f1d1d] px-4 py-2 text-xs font-black text-white transition hover:bg-[#991b1b]"
                            >
                              Detail
                              <ArrowRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}