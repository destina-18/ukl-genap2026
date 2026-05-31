import {
  CheckCircle2,
  Clock,
  ClipboardList,
  ShoppingBag,
  XCircle,
} from "lucide-react";

export type OrderItem = {
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

export function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

export function getToken() {
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

export function getArrayFromResponse(response: any): Order[] {
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

export function getRawNumber(value: any) {
  const numberValue = Number(value || 0);
  return Number.isNaN(numberValue) ? 0 : numberValue;
}

export function getOrderId(order: Order) {
  return order.id || order.orderId;
}

export function getOrderStatus(order: Order) {
  return String(order.status || "PENDING").toUpperCase();
}

export function getOrderItems(order: Order) {
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

export function getItemQuantity(item: OrderItem) {
  return getRawNumber(item.quantity || item.qty || 1);
}

export function getItemSubtotal(item: OrderItem) {
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

export function getItemPrice(item: OrderItem) {
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

export function getOrderTotal(order: Order) {
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

export function getCustomerName(order: Order) {
  return (
    order.customer?.name ||
    order.customerName ||
    order.customer_name ||
    "Customer"
  );
}

export function getCustomerWhatsapp(order: Order) {
  return order.customer?.whatsappNumber || order.customer?.whatsapp_number || "";
}

export function formatRupiah(value: number | string | undefined | null) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
}

export function formatDate(dateString?: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function getStatusStyle(status?: string) {
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