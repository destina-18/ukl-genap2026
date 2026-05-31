"use client";

import { CheckCircle2, ClipboardList, Clock } from "lucide-react";
import type { Order } from "./order-card";

type OrderStatsProps = {
  orders: Order[];
  loading: boolean;
};

export default function OrderStats({ orders, loading }: OrderStatsProps) {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => String(order.status || "").toUpperCase() === "PENDING"
  ).length;

  const completedOrders = orders.filter(
    (order) => String(order.status || "").toUpperCase() === "COMPLETED"
  ).length;

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
          <ClipboardList className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-gray-500">Total Pesanan</p>

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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-gray-500">Selesai</p>

        <h2 className="mt-2 text-4xl font-black text-green-700">
          {loading ? "..." : completedOrders}
        </h2>
      </div>
    </section>
  );
}