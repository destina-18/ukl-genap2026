"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  RefreshCcw,
  Utensils,
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