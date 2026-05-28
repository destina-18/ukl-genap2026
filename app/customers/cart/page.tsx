"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Utensils,
  Wallet,
  Banknote,
  CreditCard,
} from "lucide-react";

type CartItem = {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  vendorId?: number | string;
  quantity: number;
};

type PaymentMethod = "CASH" | "ONLINE";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
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

export default function CustomersCartPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  function loadCart() {
    const cart = localStorage.getItem("cart");

    if (!cart) {
      setCartItems([]);
      return;
    }

    try {
      const parsedCart = JSON.parse(cart);
      setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
    } catch (error) {
      console.log("Gagal membaca cart:", error);
      setCartItems([]);
    }
  }

  function saveCart(items: CartItem[]) {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  }

  function handleIncrease(id: number | string) {
    const updatedCart = cartItems.map((item) =>
      String(item.id) === String(id)
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    saveCart(updatedCart);
  }

  function handleDecrease(id: number | string) {
    const updatedCart = cartItems
      .map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  }

  function handleRemove(id: number | string) {
    const confirmDelete = confirm("Hapus menu ini dari keranjang?");

    if (!confirmDelete) return;

    const updatedCart = cartItems.filter(
      (item) => String(item.id) !== String(id)
    );

    saveCart(updatedCart);
  }

  function handleClearCart() {
    const confirmClear = confirm("Kosongkan semua keranjang?");

    if (!confirmClear) return;

    saveCart([]);
  }

  async function handleCheckout() {
    if (cartItems.length === 0) {
      alert("Keranjang masih kosong");
      return;
    }

    if (!paymentMethod) {
      alert("Pilih metode pembayaran dulu");
      return;
    }

    try {
      setLoadingCheckout(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const payload = {
        paymentMethod,
        items: cartItems.map((item) => ({
          menuId: Number(item.id),
          quantity: item.quantity,
        })),
      };

      console.log("CHECKOUT PAYLOAD:", payload);

      const response = await fetch(`${BASE_API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      console.log("CHECKOUT RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Checkout gagal");
        return;
      }

      localStorage.removeItem("cart");
      setCartItems([]);

      alert("Checkout berhasil");
      window.location.href = "/customers/orders";
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Gagal terhubung ke server saat checkout");
    } finally {
      setLoadingCheckout(false);
    }
  }

  const totalPrice = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price || 0) * item.quantity,
      0
    );
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/customers/menu"
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Menu
              </Link>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Keranjang
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Cek pesananmu sebelum checkout. Kamu bisa menambah, mengurangi,
                atau menghapus menu dari keranjang.
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-5 py-4 backdrop-blur">
              <p className="text-sm font-bold text-red-100">Total Item</p>
              <p className="text-3xl font-black">{totalItems}</p>
            </div>
          </div>
        </section>

        {cartItems.length === 0 ? (
          <section className="rounded-[1.5rem] border border-dashed border-[#7f1d1d]/20 bg-white p-10 text-center shadow-lg shadow-red-900/5">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
              <ShoppingCart className="h-10 w-10" />
            </div>

            <h2 className="text-2xl font-black text-gray-950">
              Keranjang masih kosong
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Pilih menu kantin dulu, lalu tambahkan ke keranjang.
            </p>

            <Link
              href="/customers/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b]"
            >
              <Utensils className="h-4 w-4" />
              Lihat Menu
            </Link>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const subtotal = Number(item.price || 0) * item.quantity;

                return (
                  <article
                    key={String(item.id)}
                    className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5"
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center">
                      <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#fff7f7] text-[#7f1d1d] md:w-32">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Utensils className="h-10 w-10" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-black text-gray-950">
                          {item.name}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-[#7f1d1d]">
                          {formatRupiah(Number(item.price || 0))}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                          Subtotal:{" "}
                          <span className="font-black text-gray-800">
                            {formatRupiah(subtotal)}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                        <div className="flex items-center gap-2 rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-2">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#7f1d1d] shadow-sm transition hover:bg-red-100"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="w-8 text-center text-sm font-black">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleIncrease(item.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7f1d1d] text-white shadow-sm transition hover:bg-[#991b1b]"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="h-fit rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <Wallet className="h-7 w-7" />
              </div>

              <h2 className="text-2xl font-black text-gray-950">
                Ringkasan Pesanan
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total item</span>
                  <span className="font-black text-gray-900">{totalItems}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total harga</span>
                  <span className="font-black text-[#7f1d1d]">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>

                <div className="border-t border-[#7f1d1d]/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">
                      Grand Total
                    </span>
                    <span className="text-xl font-black text-[#7f1d1d]">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-black text-gray-800">
                  Metode Pembayaran
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "CASH"
                        ? "border-[#7f1d1d] bg-[#7f1d1d] text-white shadow-lg shadow-red-900/20"
                        : "border-[#7f1d1d]/10 bg-white text-gray-700 hover:bg-[#fff7f7]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        paymentMethod === "CASH"
                          ? "bg-white/15 text-white"
                          : "bg-[#7f1d1d]/10 text-[#7f1d1d]"
                      }`}
                    >
                      <Banknote className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-black">CASH</p>
                      <p
                        className={`text-xs ${
                          paymentMethod === "CASH"
                            ? "text-red-100"
                            : "text-gray-500"
                        }`}
                      >
                        Bayar langsung di kantin
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
                      paymentMethod === "ONLINE"
                        ? "border-[#7f1d1d] bg-[#7f1d1d] text-white shadow-lg shadow-red-900/20"
                        : "border-[#7f1d1d]/10 bg-white text-gray-700 hover:bg-[#fff7f7]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        paymentMethod === "ONLINE"
                          ? "bg-white/15 text-white"
                          : "bg-[#7f1d1d]/10 text-[#7f1d1d]"
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-black">ONLINE</p>
                      <p
                        className={`text-xs ${
                          paymentMethod === "ONLINE"
                            ? "text-red-100"
                            : "text-gray-500"
                        }`}
                      >
                        Pembayaran online
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="mt-6 w-full rounded-2xl bg-[#7f1d1d] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingCheckout ? "Memproses..." : "Checkout"}
              </button>

              <button
                type="button"
                onClick={handleClearCart}
                className="mt-3 w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-4 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7]"
              >
                Kosongkan Keranjang
              </button>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}