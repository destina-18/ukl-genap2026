"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart, Utensils } from "lucide-react";
import QRCode from "react-qr-code";

import CartItemCard, { type CartItem } from "./cart-item-card";
import CartSummary, { type PaymentMethod } from "./cart-summary";

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
  const [checkoutResult, setCheckoutResult] = useState<null | {
    orderCode: string;
    totalAmount: number;
    paymentStatus: string;
    qrCodeUrl?: string;
  }>(null);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  }

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

    try {
      setLoadingCheckout(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const checkoutPayload = {
        paymentMethod,
        items: cartItems.map((item) => ({
          menuId: Number(item.id),
          quantity: item.quantity,
        })),
      };

      console.log("CHECKOUT PAYLOAD:", checkoutPayload);

      const response = await fetch(`${BASE_API_URL}/api/orders/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(checkoutPayload),
      });

      const data = await response.json().catch(() => null);

      console.log("CHECKOUT RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Checkout gagal");
        return;
      }

      const result = data?.data ?? data;

      localStorage.removeItem("cart");
      setCartItems([]);

      if (paymentMethod === "ONLINE" && result?.qrCodeUrl) {
        setCheckoutResult({
          orderCode: result.orderCode,
          totalAmount: result.totalAmount,
          paymentStatus: result.paymentStatus,
          qrCodeUrl: result.qrCodeUrl,
        });
        alert("Checkout berhasil. Silakan scan QR untuk membayar.");
        return;
      }

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

        {checkoutResult?.qrCodeUrl ? (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
              <h2 className="text-2xl font-black text-gray-950">
                Selesaikan Pembayaran
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Scan QRIS berikut untuk membayar pesanan.
              </p>

              <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[#7f1d1d]/20 bg-[#fff7f7] p-6">
                <QRCode value={checkoutResult.qrCodeUrl} size={220} />
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Order #{checkoutResult.orderCode}
                  </p>
                  <p className="text-lg font-black text-[#7f1d1d]">
                    {formatRupiah(checkoutResult.totalAmount)}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    Status: {checkoutResult.paymentStatus}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/customers/orders"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b]"
                >
                  Lihat Status Pesanan
                </Link>
                <button
                  type="button"
                  onClick={() => setCheckoutResult(null)}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7]"
                >
                  Buat Pesanan Baru
                </button>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
              <h3 className="text-lg font-black text-gray-950">
                Tips Pembayaran
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-gray-600">
                <li>Gunakan aplikasi e-wallet / mobile banking.</li>
                <li>Scan QRIS di atas dan selesaikan pembayaran.</li>
                <li>Status akan berubah otomatis setelah pembayaran sukses.</li>
              </ul>
            </div>
          </section>
        ) : cartItems.length === 0 ? (
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
              {cartItems.map((item) => (
                <CartItemCard
                  key={String(item.id)}
                  item={item}
                  onIncrease={handleIncrease}
                  onDecrease={handleDecrease}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            <CartSummary
              totalItems={totalItems}
              totalPrice={totalPrice}
              paymentMethod={paymentMethod}
              loadingCheckout={loadingCheckout}
              onChangePaymentMethod={setPaymentMethod}
              onCheckout={handleCheckout}
              onClearCart={handleClearCart}
            />
          </section>
        )}
      </div>
    </main>
  );
}