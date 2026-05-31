import {
  CheckCircle2,
  ShoppingBag,
  Utensils,
  Wallet,
  XCircle,
} from "lucide-react";

import {
  formatDate,
  formatRupiah,
  getCustomerName,
  getCustomerWhatsapp,
  getItemPrice,
  getItemQuantity,
  getItemSubtotal,
  getOrderId,
  getOrderItems,
  getOrderStatus,
  getOrderTotal,
  getStatusStyle,
  type Order,
} from "./order-helpers";

type Props = {
  order: Order;
  actionLoading: string;
  updateOrderStatus: (orderId: number | string, action: string) => void;
};

export default function OrderCard({
  order,
  actionLoading,
  updateOrderStatus,
}: Props) {
  const orderId = getOrderId(order);
  const status = getOrderStatus(order);
  const statusInfo = getStatusStyle(status);
  const StatusIcon = statusInfo.icon;
  const items = getOrderItems(order);

  const canAcceptReject = status === "PENDING";
  const canReady = status === "ACCEPTED";
  const canComplete = status === "READY";

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-lg shadow-red-900/5">
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
              Dibuat: {formatDate(order.createdAt || order.created_at)}
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
            <p className="text-sm font-bold text-gray-500">Total Pembayaran</p>

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
                      <p className="font-black text-gray-950">{menuName}</p>

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
                onClick={() => updateOrderStatus(String(orderId), "reject")}
                disabled={actionLoading === `${orderId}-reject`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <XCircle className="h-4 w-4" />
                {actionLoading === `${orderId}-reject`
                  ? "Menolak..."
                  : "Tolak"}
              </button>

              <button
                onClick={() => updateOrderStatus(String(orderId), "accept")}
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
              onClick={() => updateOrderStatus(String(orderId), "ready")}
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
              onClick={() => updateOrderStatus(String(orderId), "complete")}
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
}