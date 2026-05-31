"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart, Utensils } from "lucide-react";

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