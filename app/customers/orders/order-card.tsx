"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  ShoppingBag,
  Utensils,
  Wallet,
  XCircle,
} from "lucide-react";

import Rating from "./rating";

export type OrderItem = {
  id?: number | string;
  orderItemId?: number | string;
  order_item_id?: number | string;

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

  rating?: any;
  ratings?: any[];

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
  menuId?: number | string;

  [key: string]: any;
};

export type Order = {
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
  updatedAt?: string;

  vendor?: {
    id?: number | string;
    canteenName?: string;
    canteen_name?: string;
    name?: string;
  };

  items?: OrderItem[];
  orderItems?: OrderItem[];
  order_items?: OrderItem[];
  details?: OrderItem[];
  orderDetails?: OrderItem[];
  order_details?: OrderItem[];

  [key: string]: any;
};

type OrderCardProps = {
  order: Order;
  cancelLoadingId: string;
  baseApiUrl: string;
  onCancelOrder: (orderId: number | string) => void;
  onRefresh: () => void;
};

export function getOrderId(order: Order) {
  return order.id || order.orderId;
}

function getOrderItemId(item: OrderItem) {
  return item.id || item.orderItemId || item.order_item_id;
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
  return Number(item.quantity || item.qty || 1);
}

function getItemPrice(item: OrderItem) {
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

function getItemSubtotal(item: OrderItem) {
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

function getOrderTotal(order: Order) {
  const items = getOrderItems(order);

  const totalFromItems = items.reduce((sum, item) => {
    return sum + getItemSubtotal(item);
  }, 0);

  return Number(
    order.totalPrice ||
      order.total_price ||
      order.totalAmount ||
      order.total_amount ||
      order.grandTotal ||
      order.grand_total ||
      order.total ||
      totalFromItems ||
      0
  );
}

function getVendorName(order: Order) {
  return (
    order.vendor?.canteenName ||
    order.vendor?.canteen_name ||
    order.vendor?.name ||
    order.canteenName ||
    order.canteen_name ||
    order.vendorName ||
    order.vendor_name ||
    "Vendor Kantin"
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
    label: status || "Status",
    className: "bg-gray-100 text-gray-700",
    icon: ClipboardList,
  };
}

function hasRated(item: OrderItem) {
  if (item.rating) return true;
  if (Array.isArray(item.ratings) && item.ratings.length > 0) return true;
  return false;
}

export default function OrderCard({
  order,
  cancelLoadingId,
  baseApiUrl,
  onCancelOrder,
  onRefresh,
}: OrderCardProps) {
  const orderId = getOrderId(order);
  const statusInfo = getStatusStyle(order.status);
  const StatusIcon = statusInfo.icon;
  const items = getOrderItems(order);

  const orderStatus = String(order.status || "").toUpperCase();
  const canCancel = orderStatus === "PENDING";
  const canRating = orderStatus === "COMPLETED";

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
              {getVendorName(order)}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Dibuat: {formatDate(order.createdAt || order.created_at)}
            </p>
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
              const itemId = getOrderItemId(item);

              const menuName =
                item.menu?.name ||
                item.menuName ||
                item.menu_name ||
                item.name ||
                `Menu ${index + 1}`;

              const quantity = getItemQuantity(item);
              const price = getItemPrice(item);
              const subtotal = getItemSubtotal(item);
              const alreadyRated = hasRated(item);

              return (
                <div
                  key={String(itemId || index)}
                  className="rounded-2xl border border-[#7f1d1d]/10 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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

                    <div className="flex flex-col items-start gap-2 md:items-end">
                      <p className="text-sm font-black text-[#7f1d1d]">
                        {formatRupiah(subtotal)}
                      </p>

                      {canRating && itemId && !alreadyRated && (
                        <Rating
                          orderItemId={itemId}
                          baseApiUrl={baseApiUrl}
                          onSuccess={onRefresh}
                        />
                      )}

                      {canRating && alreadyRated && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                          Sudah dirating
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:justify-end">
          {canCancel && (
            <button
              type="button"
              onClick={() => onCancelOrder(String(orderId))}
              disabled={cancelLoadingId === String(orderId)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <XCircle className="h-4 w-4" />
              {cancelLoadingId === String(orderId)
                ? "Membatalkan..."
                : "Batalkan Pesanan"}
            </button>
          )}

          <Link
            href="/customers/menu"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7]"
          >
            Pesan Lagi
          </Link>
        </div>
      </div>
    </article>
  );
}