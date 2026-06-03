"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCcw, Bell } from "lucide-react";

import EmptyOrders from "./empty-orders";
import OrderCard, { type Order } from "./order-card";
import OrderStats from "./order-stats";
import { useSocket } from "../../../hooks/use-socket";

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

function getOrderItemsForDebug(order: any) {
  return (
    order?.items ||
    order?.orderItems ||
    order?.order_items ||
    order?.details ||
    order?.orderDetails ||
    order?.order_details ||
    []
  );
}

function debugOrders(orders: Order[]) {
  console.log("CUSTOMER ORDERS NORMALIZED:", JSON.stringify(orders, null, 2));

  orders.forEach((order: any, orderIndex) => {
    const items = getOrderItemsForDebug(order);

    console.log(`ORDER ${orderIndex + 1} DATA:`, JSON.stringify(order, null, 2));
    console.log(
      `ORDER ${orderIndex + 1} ITEMS:`,
      JSON.stringify(items, null, 2)
    );

    items.forEach((item: any, itemIndex: number) => {
      console.log(`CEK FOTO MENU ITEM ${itemIndex + 1}:`, {
        "item.imageUrl": item?.imageUrl,
        "item.image_url": item?.image_url,
        "item.image": item?.image,
        "item.photo": item?.photo,
        "item.thumbnail": item?.thumbnail,
        "item.picture": item?.picture,
        "item.menuImage": item?.menuImage,
        "item.menu_image": item?.menu_image,
        "item.menuImageUrl": item?.menuImageUrl,
        "item.menu_image_url": item?.menu_image_url,
        "item.menu?.imageUrl": item?.menu?.imageUrl,
        "item.menu?.image_url": item?.menu?.image_url,
        "item.menu?.image": item?.menu?.image,
        "item.menu?.photo": item?.menu?.photo,
        "item.Menu?.imageUrl": item?.Menu?.imageUrl,
        "item.Menu?.image_url": item?.Menu?.image_url,
        "item.cartItem?.menu?.imageUrl": item?.cartItem?.menu?.imageUrl,
      });
    });
  });
}

export default function CustomersOrdersPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const [orderUpdateNotification, setOrderUpdateNotification] = useState<{
    orderId: number;
    status: string;
    message: string;
  } | null>(null);

  const { socket, isConnected } = useSocket();

  async function getOrders(silent = false) {
    try {
      if (!silent) setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const url = new URL(`${BASE_API_URL}/api/orders/me`);
      if (selectedStatus) url.searchParams.set("status", selectedStatus);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      console.log("CUSTOMER ORDERS STATUS:", response.status);
      console.log("CUSTOMER ORDERS RAW:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        alert(data?.message || "Gagal mengambil data pesanan");
        setOrders([]);
        return;
      }

      const normalizedOrders = getArrayFromResponse(data);

      debugOrders(normalizedOrders);

      setOrders(normalizedOrders);
    } catch (error) {
      console.error("GET ORDERS ERROR:", error);
      alert("Gagal terhubung ke server saat mengambil pesanan");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder(orderId: number | string) {
    const confirmCancel = confirm("Batalkan pesanan ini?");

    if (!confirmCancel) return;

    try {
      setCancelLoadingId(String(orderId));

      const token = getToken();

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(
        `${BASE_API_URL}/api/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json().catch(() => null);

      console.log("CANCEL ORDER STATUS:", response.status);
      console.log("CANCEL ORDER RESPONSE:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        alert(data?.message || "Gagal membatalkan pesanan");
        return;
      }

      alert("Pesanan berhasil dibatalkan");
      await getOrders();
    } catch (error) {
      console.error("CANCEL ORDER ERROR:", error);
      alert("Gagal terhubung ke server saat membatalkan pesanan");
    } finally {
      setCancelLoadingId("");
    }
  }

  useEffect(() => {
    getOrders();
  }, [selectedStatus]);

  useEffect(() => {
    if (!socket) return;

    console.log("[WebSocket] Customer listening to 'orderUpdate' events");

    socket.on(
      "orderUpdate",
      (data: { orderId: number; status: string; message: string }) => {
        console.log("[WebSocket] Event orderUpdate diterima:", data);

        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            const currentId = order.id || order.orderId || order.order_id;

            if (Number(currentId) === Number(data.orderId)) {
              return {
                ...order,
                status: data.status,
              };
            }

            return order;
          })
        );

        setOrderUpdateNotification(data);
        getOrders(true);
      }
    );

    return () => {
      socket.off("orderUpdate");
    };
  }, [socket]);

  return (
    <main className="relative min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      {orderUpdateNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-800 to-red-950 p-5 text-white shadow-2xl shadow-red-900/30 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <Bell className="h-5 w-5 text-red-100" />
            </div>

            <div className="flex-1">
              <h4 className="font-extrabold tracking-tight text-white">
                Status Pesanan Diperbarui!
              </h4>

              <p className="mt-1 text-xs leading-snug text-red-200">
                {orderUpdateNotification.message}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderUpdateNotification(null)}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOrderUpdateNotification(null);
                    getOrders();
                  }}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-red-900 transition hover:bg-red-50"
                >
                  Segarkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/customers/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Link>

              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight md:text-5xl">
                Pesanan Saya
                <span
                  className={`inline-flex h-3.5 w-3.5 rounded-full ${isConnected ? "animate-pulse bg-green-400" : "bg-red-400"
                    }`}
                  title={
                    isConnected
                      ? "WebSocket Terhubung"
                      : "WebSocket Terputus"
                  }
                />
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Lihat status pesananmu, mulai dari pending, diterima, siap
                diambil, sampai selesai.
              </p>
            </div>

            <button
              type="button"
              onClick={() => getOrders()}
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

        <div className="mb-6 flex items-center gap-3">
          <p className="text-sm font-bold text-gray-500">Filter status:</p>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7f1d1d]/20"
          >
            <option value="">Semua</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Diterima</option>
            <option value="REJECTED">Ditolak</option>
            <option value="READY">Siap Diambil</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
        <OrderStats orders={orders} loading={loading} />

        {loading ? (
          <section className="flex min-h-[300px] items-center justify-center rounded-[1.5rem] bg-white shadow-lg shadow-red-900/5">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />

              <p className="text-sm font-bold text-[#7f1d1d]">
                Memuat pesanan...
              </p>
            </div>
          </section>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <section className="space-y-5">
            {orders.map((order, index) => (
              <OrderCard
                key={String(
                  order.id || order.orderId || order.order_id || index
                )}
                order={order}
                cancelLoadingId={cancelLoadingId}
                baseApiUrl={BASE_API_URL}
                onCancelOrder={handleCancelOrder}
                onRefresh={getOrders}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}