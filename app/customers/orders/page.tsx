"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import EmptyOrders from "./empty-orders";
import OrderCard, { type Order } from "./order-card";
import OrderStats from "./order-stats";

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

export default function CustomersOrdersPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState<string>("");

  async function getOrders() {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const response = await fetch(`${BASE_API_URL}/api/orders/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      console.log("CUSTOMER ORDERS STATUS:", response.status);
      console.log("CUSTOMER ORDERS RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal mengambil data pesanan");
        setOrders([]);
        return;
      }

      setOrders(getArrayFromResponse(data));
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
      console.log("CANCEL ORDER RESPONSE:", data);

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
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
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

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Pesanan Saya
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Lihat status pesananmu, mulai dari pending, diterima, siap
                diambil, sampai selesai.
              </p>
            </div>

            <button
              type="button"
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
                key={String(order.id || order.orderId || index)}
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