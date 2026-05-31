"use client";

import { Banknote, CreditCard, Wallet } from "lucide-react";

export type PaymentMethod = "CASH" | "ONLINE";

type CartSummaryProps = {
  totalItems: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  loadingCheckout: boolean;
  onChangePaymentMethod: (value: PaymentMethod) => void;
  onCheckout: () => void;
  onClearCart: () => void;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function CartSummary({
  totalItems,
  totalPrice,
  paymentMethod,
  loadingCheckout,
  onChangePaymentMethod,
  onCheckout,
  onClearCart,
}: CartSummaryProps) {
  return (
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
            onClick={() => onChangePaymentMethod("CASH")}
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
                  paymentMethod === "CASH" ? "text-red-100" : "text-gray-500"
                }`}
              >
                Bayar langsung di kantin
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod("ONLINE")}
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
                  paymentMethod === "ONLINE" ? "text-red-100" : "text-gray-500"
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
        onClick={onCheckout}
        disabled={loadingCheckout}
        className="mt-6 w-full rounded-2xl bg-[#7f1d1d] px-5 py-4 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loadingCheckout ? "Memproses..." : "Checkout"}
      </button>

      <button
        type="button"
        onClick={onClearCart}
        className="mt-3 w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-4 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7]"
      >
        Kosongkan Keranjang
      </button>
    </aside>
  );
}