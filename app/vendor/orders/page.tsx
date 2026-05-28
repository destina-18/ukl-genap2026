"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ClipboardList,
  RefreshCcw,
  ShoppingBag,
  Utensils,
  Wallet,
  XCircle,
} from "lucide-react";

type OrderItem = {
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
    id?: number | string;
    name?: string;
    price?: number | string;
    imageUrl?: string;
    image?: string;
  };

  menuName?: string;
  menu_name?: string;
  name?: string;

  [key: string]: any;
};

type Order = {
  id?: number | string;
  orderId?: number | string;

  status?: string;
  paymentMethod?: string;
  payment_method?: string;

  totalPrice?: number | string;
  total_price?: number | string;
  totalAmount?: number | string;
  total_amount?: number | string;
  grandTotal?: number | string;
  grand_total?: number | string;
  total?: number | string;

  createdAt?: string;
  created_at?: string;

  customer?: {
    id?: number | string;
    name?: string;
    email?: string;
    whatsappNumber?: string;
    whatsapp_number?: string;
  };

  customerName?: string;
  customer_name?: string;

  items?: OrderItem[];
  orderItems?: OrderItem[];
  order_items?: OrderItem[];
  details?: OrderItem[];
  orderDetails?: OrderItem[];
  order_details?: OrderItem[];

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

function getArrayFromResponse(response: any): Order[] {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;

  if (Array.isArray(response?.orders)) return response.orders;
  if (Array.isArray(response?.data?.orders)) return response.data.orders;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.result)) return response.data.result;

  return [];
}

function getRawNumber(value: any) {
  const numberValue = Number(value || 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function getOrderId(order: Order) {
  return order.id || order.orderId;
}

function getOrderStatus(order: Order) {
  return String(order.status || "PENDING").toUpperCase();
}

function getOrderItems(order: Order) {
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

function getItemQuantity(item: OrderItem) {
  return getRawNumber(item.quantity || item.qty || 1);
}

function getItemSubtotal(item: OrderItem) {
  const quantity = getItemQuantity(item);

  const subtotal = getRawNumber(
    item.subtotal ||
      item.subTotal ||
      item.sub_total ||
      item.totalPrice ||
      item.total_price ||
      item.total
  );

  const price = getRawNumber(
    item.price ||
      item.menuPrice ||
      item.menu_price ||
      item.unitPrice ||
      item.unit_price ||
      item.menu?.price
  );

  if (subtotal > 0) return subtotal;
  if (price > 0) return price * quantity;

  return 0;
}

function getItemPrice(item: OrderItem) {
  const quantity = getItemQuantity(item);

  const price = getRawNumber(
    item.price ||
      item.menuPrice ||
      item.menu_price ||
      item.unitPrice ||
      item.unit_price ||
      item.menu?.price
  );

  if (price > 0) return price;

  const subtotal = getItemSubtotal(item);

  if (subtotal > 0 && quantity > 0) {
    return subtotal / quantity;
  }

  return 0;
}

function getOrderTotal(order: Order) {
  const items = getOrderItems(order);

  const totalFromItems = items.reduce((sum: number, item: OrderItem) => {
    return sum + getItemSubtotal(item);
  }, 0);

  const totalFromOrder = getRawNumber(
    order.totalPrice ||
      order.total_price ||
      order.totalAmount ||
      order.total_amount ||
      order.grandTotal ||
      order.grand_total ||
      order.total
  );

  if (totalFromOrder > 0) return totalFromOrder;
  if (totalFromItems > 0) return totalFromItems;

  return 0;
}

function getCustomerName(order: Order) {
  return (
    order.customer?.name ||
    order.customerName ||
    order.customer_name ||
    "Customer"
  );
}

function getCustomerWhatsapp(order: Order) {
  return order.customer?.whatsappNumber || order.customer?.whatsapp_number || "";
}

function formatRupiah(value: number | string | undefined | null) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusStyle(status?: string) {
  const finalStatus = String(status || "").toUpperCase();

  if (finalStatus === "PENDING") {
    return {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    };
  }

  if (finalStatus === "ACCEPTED") {
    return {
      label: "Diterima",
      className: "bg-blue-100 text-blue-700",
      icon: CheckCircle2,
    };
  }

  if (finalStatus === "READY") {
    return {
      label: "Siap Diambil",
      className: "bg-purple-100 text-purple-700",
      icon: ShoppingBag,
    };
  }

  if (finalStatus === "COMPLETED") {
    return {
      label: "Selesai",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle2,
    };
  }

  if (finalStatus === "REJECTED") {
    return {
      label: "Ditolak",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    };
  }

  if (finalStatus === "CANCELLED" || finalStatus === "CANCELED") {
    return {
      label: "Dibatalkan",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: finalStatus || "Status",
    className: "bg-gray-100 text-gray-700",
    icon: ClipboardList,
  };
}

export default function VendorOrdersPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>("");

  async function getOrders() {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/vendor/orders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      console.log("VENDOR ORDERS STATUS:", response.status);
      console.log("VENDOR ORDERS RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal mengambil data order vendor");
        setOrders([]);
        return;
      }

      setOrders(getArrayFromResponse(data));
    } catch (error) {
      console.error("GET VENDOR ORDERS ERROR:", error);
      alert("Gagal terhubung ke server saat mengambil order");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number | string, action: string) {
    let reason = "";

    if (action === "reject") {
      const inputReason = prompt("Masukkan alasan menolak order:");

      if (!inputReason || inputReason.trim().length < 3) {
        alert("Alasan penolakan minimal 3 karakter.");
        return;
      }

      reason = inputReason.trim();
    }

    const actionLabel =
      action === "accept"
        ? "terima"
        : action === "reject"
        ? "tolak"
        : action === "ready"
        ? "tandai siap diambil"
        : "selesaikan";

    const confirmAction = confirm(`Yakin ingin ${actionLabel} order ini?`);

    if (!confirmAction) return;

    try {
      setActionLoading(`${orderId}-${action}`);

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(
        `${BASE_API_URL}/api/vendor/orders/${orderId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(action === "reject"
              ? { "Content-Type": "application/json" }
              : {}),
          },
          body:
            action === "reject"
              ? JSON.stringify({
                  reason: reason,
                })
              : undefined,
        }
      );

      const data = await response.json().catch(() => null);

      console.log(`ORDER ${action.toUpperCase()} STATUS:`, response.status);
      console.log(`ORDER ${action.toUpperCase()} RESPONSE:`, data);

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;

        alert(message || `Gagal ${actionLabel} order`);
        return;
      }

      alert(`Order berhasil di-${actionLabel}`);
      await getOrders();
    } catch (error) {
      console.error(`ORDER ${action.toUpperCase()} ERROR:`, error);
      alert(`Gagal terhubung ke server saat ${actionLabel} order`);
    } finally {
      setActionLoading("");
    }
  }

  const totalOrders = orders.length;

  const pendingOrders = useMemo(() => {
    return orders.filter((order) => getOrderStatus(order) === "PENDING").length;
  }, [orders]);

  const processingOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = getOrderStatus(order);
      return status === "ACCEPTED" || status === "READY";
    }).length;
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((order) => getOrderStatus(order) === "COMPLETED")
      .length;
  }, [orders]);

  const totalIncome = useMemo(() => {
    return orders
      .filter((order) => getOrderStatus(order) === "COMPLETED")
      .reduce((total, order) => total + getOrderTotal(order), 0);
  }, [orders]);

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/vendor/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Link>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Order Vendor
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Kelola pesanan customer: terima, tolak, tandai siap diambil,
                dan selesaikan order.
              </p>
            </div>

            <button
              onClick={getOrders}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <ClipboardList className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Total Order</p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : totalOrders}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
              <Clock className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Pending</p>
            <h2 className="mt-2 text-4xl font-black text-yellow-700">
              {loading ? "..." : pendingOrders}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-gray-500">
              Diproses / Ready
            </p>
            <h2 className="mt-2 text-4xl font-black text-blue-700">
              {loading ? "..." : processingOrders}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-gray-500">Selesai</p>
            <h2 className="mt-2 text-4xl font-black text-green-700">
              {loading ? "..." : completedOrders}
            </h2>
          </div>
        </section>

        <section className="mb-8 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
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
              href="/vendor/menu"
              className="inline-flex w-fit items-center gap-2 rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7]"
            >
              <Utensils className="h-4 w-4" />
              Kelola Menu
            </Link>
          </div>
        </section>

        {loading ? (
          <section className="flex min-h-[300px] items-center justify-center rounded-[1.5rem] bg-white shadow-lg shadow-red-900/5">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />
              <p className="text-sm font-bold text-[#7f1d1d]">
                Memuat order...
              </p>
            </div>
          </section>
        ) : orders.length === 0 ? (
          <section className="rounded-[1.5rem] border border-dashed border-[#7f1d1d]/20 bg-white p-10 text-center shadow-lg shadow-red-900/5">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <ClipboardList className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Belum ada order
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Pesanan customer yang masuk ke kantinmu akan muncul di sini.
            </p>
          </section>
        ) : (
          <section className="space-y-5">
            {orders.map((order) => {
              const orderId = getOrderId(order);
              const status = getOrderStatus(order);
              const statusInfo = getStatusStyle(status);
              const StatusIcon = statusInfo.icon;
              const items = getOrderItems(order);

              const canAcceptReject = status === "PENDING";
              const canReady = status === "ACCEPTED";
              const canComplete = status === "READY";

              return (
                <article
                  key={String(orderId)}
                  className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-lg shadow-red-900/5"
                >
                  <div className="border-b border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#7f1d1d]/10 px-3 py-1 text-xs font-black text-[#7f1d1d]">
                            Order #{orderId}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${statusInfo.className}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </div>

                        <h2 className="text-xl font-black text-gray-950">
                          {getCustomerName(order)}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Dibuat:{" "}
                          {formatDate(order.createdAt || order.created_at)}
                        </p>

                        {order.customer?.email && (
                          <p className="mt-1 text-sm text-gray-500">
                            {order.customer.email}
                          </p>
                        )}

                        {getCustomerWhatsapp(order) && (
                          <p className="mt-1 text-sm text-gray-500">
                            WA: {getCustomerWhatsapp(order)}
                          </p>
                        )}
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-sm font-bold text-gray-500">
                          Total Pembayaran
                        </p>

                        <p className="text-2xl font-black text-[#7f1d1d]">
                          {formatRupiah(getOrderTotal(order))}
                        </p>

                        <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-gray-600">
                          <Wallet className="h-3 w-3" />
                          {order.paymentMethod || order.payment_method || "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="mb-4 flex items-center gap-2 text-sm font-black text-gray-800">
                      <ShoppingBag className="h-4 w-4 text-[#7f1d1d]" />
                      Detail Item
                    </div>

                    {items.length === 0 ? (
                      <div className="rounded-2xl bg-[#fff7f7] p-4 text-sm text-gray-500">
                        Detail item tidak tersedia.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {items.map((item, index) => {
                          const menuName =
                            item.menu?.name ||
                            item.menuName ||
                            item.menu_name ||
                            item.name ||
                            `Menu ${index + 1}`;

                          const quantity = getItemQuantity(item);
                          const price = getItemPrice(item);
                          const subtotal = getItemSubtotal(item);

                          return (
                            <div
                              key={String(item.id || index)}
                              className="flex items-center justify-between gap-4 rounded-2xl border border-[#7f1d1d]/10 p-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                                  <Utensils className="h-5 w-5" />
                                </div>

                                <div>
                                  <p className="font-black text-gray-950">
                                    {menuName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {quantity} x {formatRupiah(price)}
                                  </p>
                                </div>
                              </div>

                              <p className="text-sm font-black text-[#7f1d1d]">
                                {formatRupiah(subtotal)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
                      {canAcceptReject && (
                        <>
                          <button
                            onClick={() =>
                              updateOrderStatus(String(orderId), "reject")
                            }
                            disabled={actionLoading === `${orderId}-reject`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <XCircle className="h-4 w-4" />
                            {actionLoading === `${orderId}-reject`
                              ? "Menolak..."
                              : "Tolak"}
                          </button>

                          <button
                            onClick={() =>
                              updateOrderStatus(String(orderId), "accept")
                            }
                            disabled={actionLoading === `${orderId}-accept`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {actionLoading === `${orderId}-accept`
                              ? "Menerima..."
                              : "Terima"}
                          </button>
                        </>
                      )}

                      {canReady && (
                        <button
                          onClick={() =>
                            updateOrderStatus(String(orderId), "ready")
                          }
                          disabled={actionLoading === `${orderId}-ready`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-50 px-5 py-3 text-sm font-black text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          {actionLoading === `${orderId}-ready`
                            ? "Memproses..."
                            : "Siap Diambil"}
                        </button>
                      )}

                      {canComplete && (
                        <button
                          onClick={() =>
                            updateOrderStatus(String(orderId), "complete")
                          }
                          disabled={actionLoading === `${orderId}-complete`}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-50 px-5 py-3 text-sm font-black text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {actionLoading === `${orderId}-complete`
                            ? "Menyelesaikan..."
                            : "Selesaikan"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}