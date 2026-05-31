"use client";

import { ShoppingCart, Star, Utensils } from "lucide-react";

export type Menu = {
  id?: number | string;
  menuId?: number | string;
  _id?: number | string;
  name?: string;
  menuName?: string;
  description?: string;
  price?: number | string;
  image?: string;
  imageUrl?: string;
  stock?: number;
  isAvailable?: boolean;
  category?: {
    name?: string;
  };
  vendor?: {
    name?: string;
  };
  [key: string]: any;
};

type MenuCardProps = {
  menu: Menu;
  onAddToCart: (menu: Menu) => void;
};

export function getMenuId(menu: Menu) {
  return menu.id || menu.menuId || menu._id;
}

export function formatRupiah(value: number | string | undefined) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
}

export default function MenuCard({ menu, onAddToCart }: MenuCardProps) {
  const menuId = getMenuId(menu);
  const menuName = menu.name || menu.menuName || "Menu";
  const menuImage = menu.imageUrl || menu.image;
  const available = menu.isAvailable !== false;

  return (
    <article
      key={String(menuId)}
      className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-md shadow-red-900/5"
    >
      <div className="relative h-44 bg-[#fff7f7]">
        {menuImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={menuImage}
            alt={menuName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#7f1d1d]">
            <Utensils className="h-14 w-14" />
          </div>
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-[#7f1d1d] shadow">
          {menu.category?.name || "Menu"}
        </div>

        <div
          className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black shadow ${
            available
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {available ? "Tersedia" : "Habis"}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-black text-gray-950">
            {menuName}
          </h3>

          <div className="flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-1 text-xs font-black text-yellow-700">
            <Star className="h-3 w-3 fill-current" />
            5.0
          </div>
        </div>

        <p className="line-clamp-2 min-h-[40px] text-sm leading-5 text-gray-500">
          {menu.description || "Menu kantin siap dipesan."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400">Harga</p>
            <p className="text-lg font-black text-[#7f1d1d]">
              {formatRupiah(menu.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onAddToCart(menu)}
            disabled={!available}
            className="flex items-center gap-2 rounded-2xl bg-[#7f1d1d] px-4 py-3 text-sm font-black text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingCart className="h-4 w-4" />
            Tambah
          </button>
        </div>
      </div>
    </article>
  );
}