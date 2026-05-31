"use client";

import { Minus, Plus, Trash2, Utensils } from "lucide-react";

export type CartItem = {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  vendorId?: number | string;
  quantity: number;
};

type CartItemCardProps = {
  item: CartItem;
  onIncrease: (id: number | string) => void;
  onDecrease: (id: number | string) => void;
  onRemove: (id: number | string) => void;
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function CartItemCard({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemCardProps) {
  const subtotal = Number(item.price || 0) * item.quantity;

  return (
    <article className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
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
          <h2 className="text-xl font-black text-gray-950">{item.name}</h2>

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
              onClick={() => onDecrease(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#7f1d1d] shadow-sm transition hover:bg-red-100"
            >
              <Minus className="h-4 w-4" />
            </button>

            <span className="w-8 text-center text-sm font-black">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrease(item.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7f1d1d] text-white shadow-sm transition hover:bg-[#991b1b]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </div>
      </div>
    </article>
  );
}