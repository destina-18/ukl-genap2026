"use client";

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
  getCustomerEmail,
  getCustomerName,
  getCustomerWhatsapp,
  getItemMenuName,
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

type OrderCardProps = {
  order: Order;
  menus: any[];
  actionLoading: string;
  updateOrderStatus: (orderId: number | string, action: string) => void;
};

function getImageUrl(image: string) {
  if (!image) return "";

  const baseApiUrl =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${baseApiUrl}${image.startsWith("/") ? image : `/${image}`}`;
}

function getMenuImage(item: any, menus: any[]) {
  const menuId = item?.menuId || item?.menu_id || item?.menu?.id;

  const menu = menus.find(
    (menuItem) => Number(menuItem?.id) === Number(menuId)
  );

  const image =
    item?.menu?.imageUrl ||
    item?.menu?.image_url ||
    item?.menu?.image ||
    item?.menu?.photo ||
    item?.menu?.thumbnail ||
    item?.imageUrl ||
    item?.image_url ||
    item?.image ||
    item?.menuImage ||
    menu?.imageUrl ||
    menu?.image_url ||
    menu?.image ||
    menu?.photo ||
    menu?.thumbnail ||
    "";

  return getImageUrl(String(image || ""));
}

export default function OrderCard({
  order,
  menus,
  actionLoading,
  updateOrderStatus,
}: OrderCardProps) {
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

            {getCustomerEmail(order) && (
              <p className="mt-1 text-sm text-gray-500">
                {getCustomerEmail(order)}
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
              console.log("ITEM ORDER:", item);

              const menuName = getItemMenuName(item, index);
              const quantity = getItemQuantity(item);
              const price = getItemPrice(item);
              const subtotal = getItemSubtotal(item);
              const imageUrl = getMenuImage(item, menus);

              return (
                <div
                  key={String(item?.id || item?.menuId || item?.menu_id || index)}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#7f1d1d]/10 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#7f1d1d]/10">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={menuName}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#7f1d1d]">
                          <Utensils className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-black text-gray-950">
                        {menuName}
                      </p>

                      <p className="text-sm text-gray-500">
                        {quantity} x {formatRupiah(price)}
                      </p>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm font-black text-[#7f1d1d]">
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
                type="button"
                onClick={() => updateOrderStatus(orderId, "reject")}
                disabled={actionLoading === `${orderId}-reject`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <XCircle className="h-4 w-4" />
                {actionLoading === `${orderId}-reject`
                  ? "Menolak..."
                  : "Tolak"}
              </button>

              <button
                type="button"
                onClick={() => updateOrderStatus(orderId, "accept")}
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
              type="button"
              onClick={() => updateOrderStatus(orderId, "ready")}
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
              type="button"
              onClick={() => updateOrderStatus(orderId, "complete")}
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