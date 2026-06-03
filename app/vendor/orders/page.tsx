"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  RefreshCcw,
  Utensils,
  Bell,
} from "lucide-react";

import OrderCard from "./order-card";
import OrderEmpty from "./order-empty";
import OrderLoading from "./order-loading";
import OrderStats from "./order-stats";

import {
  formatRupiah,
  getArrayFromResponse,
  getOrderStatus,
  getOrderTotal,
  getToken,
  type Order,
} from "./order-helpers";
import { useSocket } from "../../../hooks/use-socket";

export default function VendorOrdersPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [orders, setOrders] = useState<Order[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>("");
  const [newOrderNotification, setNewOrderNotification] = useState<{
    orderId: number;
    message: string;
  } | null>(null);

  const { socket, isConnected } = useSocket();

  async function getMenus() {
    try {
      const token = getToken();

      if (!token) {
        return;
      }

      const response = await fetch(
        `${BASE_API_URL}/api/vendor/menus?page=1&limit=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);

      console.log("VENDOR MENUS FOR ORDER IMAGE STATUS:", response.status);
      console.log("VENDOR MENUS FOR ORDER IMAGE RESPONSE:", data);

      if (!response.ok) {
        setMenus([]);
        return;
      }

      setMenus(getArrayFromResponse(data));
    } catch (error) {
      console.error("GET VENDOR MENUS FOR ORDER IMAGE ERROR:", error);
      setMenus([]);
    }
  }

  async function getOrders(silent = false) {
    try {
      if (!silent) setLoading(true);

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
    getMenus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log("[WebSocket] Vendor listening to 'newOrder' events");

    socket.on("newOrder", (data: { orderId: number; message: string }) => {
      console.log("[WebSocket] Event newOrder diterima:", data);

      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;

        if (AudioContext) {
          const ctx = new AudioContext();
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
          gain1.gain.setValueAtTime(0.1, ctx.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.3);

          setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();

            osc2.type = "sine";
            osc2.frequency.setValueAtTime(880, ctx.currentTime);
            gain2.gain.setValueAtTime(0.15, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(
              0.01,
              ctx.currentTime + 0.4
            );

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.4);
          }, 120);
        }
      } catch (e) {
        console.error("Gagal memutar audio notifikasi:", e);
      }

      setNewOrderNotification(data);
      getOrders(true);
      getMenus();
    });

    return () => {
      socket.off("newOrder");
    };
  }, [socket]);

  return (
    <main className="relative min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      {newOrderNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-800 to-red-950 p-5 text-white shadow-2xl shadow-red-900/30 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <Bell className="h-5 w-5 text-red-100" />
            </div>

            <div className="flex-1">
              <h4 className="font-extrabold tracking-tight text-white">
                Pesanan Baru Masuk!
              </h4>

              <p className="mt-1 text-xs leading-snug text-red-200">
                {newOrderNotification.message}
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewOrderNotification(null);
                  }}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewOrderNotification(null);
                    getOrders();
                    getMenus();
                  }}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-red-900 transition hover:bg-red-50"
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight md:text-5xl">
                Order Vendor
                <span
                  className={`inline-flex h-3.5 w-3.5 rounded-full ${
                    isConnected ? "animate-pulse bg-green-400" : "bg-red-400"
                  }`}
                  title={
                    isConnected
                      ? "WebSocket Terhubung"
                      : "WebSocket Terputus"
                  }
                />
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Kelola pesanan customer: terima, tolak, tandai siap diambil,
                dan selesaikan order.
              </p>
            </div>

            <button
              onClick={() => {
                getOrders();
                getMenus();
              }}
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

        <OrderStats
          loading={loading}
          totalOrders={totalOrders}
          pendingOrders={pendingOrders}
          processingOrders={processingOrders}
          completedOrders={completedOrders}
        />

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
          <OrderLoading />
        ) : orders.length === 0 ? (
          <OrderEmpty />
        ) : (
          <section className="space-y-5">
            {orders.map((order, index) => (
              <OrderCard
                key={String(order.id || order.orderId || index)}
                order={order}
                menus={menus}
                actionLoading={actionLoading}
                updateOrderStatus={updateOrderStatus}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}