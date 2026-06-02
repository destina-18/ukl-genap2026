"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
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
  amount?: number | string;

  price?: number | string;
  menuPrice?: number | string;
  menu_price?: number | string;
  unitPrice?: number | string;
  unit_price?: number | string;

  priceSnapshot?: number | string;
  price_snapshot?: number | string;

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
    menuId?: number | string;
    name?: string;
    menuName?: string;
    menu_name?: string;
    title?: string;
    price?: number | string;
  };

  Menu?: {
    id?: number | string;
    menuId?: number | string;
    name?: string;
    menuName?: string;
    menu_name?: string;
    title?: string;
    price?: number | string;
  };

  product?: {
    name?: string;
    title?: string;
    price?: number | string;
  };

  food?: {
    name?: string;
    title?: string;
    price?: number | string;
  };

  cartItem?: {
    menu?: {
      name?: string;
      menuName?: string;
      menu_name?: string;
      title?: string;
      price?: number | string;
    };
  };

  menuNameSnapshot?: string;
  menu_name_snapshot?: string;

  menuName?: string;
  menu_name?: string;
  name?: string;
  title?: string;
  productName?: string;
  product_name?: string;
  foodName?: string;
  food_name?: string;
  itemName?: string;
  item_name?: string;

  menuId?: number | string;
  menu_id?: number | string;

  [key: string]: any;
};

export type Order = {
  id?: number | string;
  orderId?: number | string;
  order_id?: number | string;
  orderCode?: string;
  order_code?: string;

  status?: string;
  paymentMethod?: string;
  payment_method?: string;
  paymentStatus?: string;
  payment_status?: string;

  subtotal?: number | string;
  subTotal?: number | string;
  sub_total?: number | string;

  totalPrice?: number | string;
  total_price?: number | string;
  totalAmount?: number | string;
  total_amount?: number | string;
  grandTotal?: number | string;
  grand_total?: number | string;
  total?: number | string;

  rejectionReason?: string;
  rejection_reason?: string;

  createdAt?: string;
  created_at?: string;
  updatedAt?: string;

  vendor?: {
    id?: number | string;
    canteenName?: string;
    canteen_name?: string;
    name?: string;
    vendorName?: string;
    vendor_name?: string;
  };

  canteenName?: string;
  canteen_name?: string;
  vendorName?: string;
  vendor_name?: string;

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
  return order.id || order.orderId || order.order_id;
}

function getOrderCode(order: Order) {
  return order.orderCode || order.order_code || getOrderId(order);
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

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function buildReceiptUrl(baseApiUrl: string, orderId: number | string) {
  const cleanBaseUrl = baseApiUrl.replace(/\/$/, "");

  if (cleanBaseUrl.endsWith("/api")) {
    return `${cleanBaseUrl}/orders/${orderId}/receipt`;
  }

  return `${cleanBaseUrl}/api/orders/${orderId}/receipt`;
}

function toNumber(value: any) {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

function getItemName(item: OrderItem, index: number) {
  return (
    item.menuNameSnapshot ||
    item.menu_name_snapshot ||
    item.menu?.name ||
    item.menu?.menuName ||
    item.menu?.menu_name ||
    item.menu?.title ||
    item.Menu?.name ||
    item.Menu?.menuName ||
    item.Menu?.menu_name ||
    item.Menu?.title ||
    item.product?.name ||
    item.product?.title ||
    item.food?.name ||
    item.food?.title ||
    item.cartItem?.menu?.name ||
    item.cartItem?.menu?.menuName ||
    item.cartItem?.menu?.menu_name ||
    item.cartItem?.menu?.title ||
    item.menuName ||
    item.menu_name ||
    item.name ||
    item.title ||
    item.productName ||
    item.product_name ||
    item.foodName ||
    item.food_name ||
    item.itemName ||
    item.item_name ||
    `Menu ${index + 1}`
  );
}

function getItemQuantity(item: OrderItem) {
  return toNumber(item.quantity || item.qty || item.amount || 1);
}

function getItemPrice(item: OrderItem) {
  return toNumber(
    item.priceSnapshot ||
      item.price_snapshot ||
      item.price ||
      item.menuPrice ||
      item.menu_price ||
      item.unitPrice ||
      item.unit_price ||
      item.menu?.price ||
      item.Menu?.price ||
      item.product?.price ||
      item.food?.price ||
      item.cartItem?.menu?.price ||
      0
  );
}

function getItemSubtotal(item: OrderItem) {
  const quantity = getItemQuantity(item);
  const price = getItemPrice(item);

  return toNumber(
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

  const totalFromOrder = toNumber(
    order.totalAmount ||
      order.total_amount ||
      order.totalPrice ||
      order.total_price ||
      order.grandTotal ||
      order.grand_total ||
      order.total ||
      0
  );

  const subtotalFromOrder = toNumber(
    order.subtotal || order.subTotal || order.sub_total || 0
  );

  if (totalFromOrder > 0) return totalFromOrder;
  if (subtotalFromOrder > 0) return subtotalFromOrder;

  return totalFromItems;
}

function getVendorName(order: Order) {
  return (
    order.vendor?.canteenName ||
    order.vendor?.canteen_name ||
    order.vendor?.name ||
    order.vendor?.vendorName ||
    order.vendor?.vendor_name ||
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
  const [receiptLoading, setReceiptLoading] = useState(false);

  const orderId = getOrderId(order);
  const orderCode = getOrderCode(order);
  const statusInfo = getStatusStyle(order.status);
  const StatusIcon = statusInfo.icon;
  const items = getOrderItems(order);

  const orderStatus = String(order.status || "").toUpperCase();
  const canCancel = orderStatus === "PENDING";
  const canRating = orderStatus === "COMPLETED";
  const canDownloadReceipt = orderStatus === "COMPLETED" && !!orderId;

  async function handleDownloadReceipt() {
    if (!orderId) {
      alert("ID order tidak ditemukan.");
      return;
    }

    try {
      setReceiptLoading(true);

      const token =
        getCookie("accessToken") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        "";

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai customer.");
        return;
      }

      const response = await fetch(buildReceiptUrl(baseApiUrl, orderId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      });

      if (!response.ok) {
        let message = "Gagal download struk.";

        try {
          const errorData = await response.json();
          message = errorData?.message || message;
        } catch {
          message = `Gagal download struk. Status: ${response.status}`;
        }

        alert(message);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `struk-order-${orderId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOWNLOAD RECEIPT ERROR:", error);
      alert("Terjadi kesalahan saat download struk.");
    } finally {
      setReceiptLoading(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-lg shadow-red-900/5">
      <div className="border-b border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#7f1d1d]/10 px-3 py-1 text-xs font-black text-[#7f1d1d]">
                Order #{orderCode}
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

            {(order.rejectionReason || order.rejection_reason) && (
              <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                Alasan ditolak:{" "}
                {order.rejectionReason || order.rejection_reason}
              </p>
            )}
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm font-bold text-gray-500">Total Pembayaran</p>

            <p className="text-2xl font-black text-[#7f1d1d]">
              {formatRupiah(getOrderTotal(order))}
            </p>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-gray-600">
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
              const menuName = getItemName(item, index);
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
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
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
          {canDownloadReceipt && (
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={receiptLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {receiptLoading ? "Mengunduh..." : "Download Struk"}
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => {
                if (orderId) onCancelOrder(orderId);
              }}
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