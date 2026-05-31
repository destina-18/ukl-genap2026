"use client";

import { Search, Utensils } from "lucide-react";
import MenuCard, { type Menu } from "./menu-card";
import { type Vendor, getVendorName } from "./vendor-list";

type MenuListProps = {
  menus: Menu[];
  search: string;
  selectedVendor?: Vendor;
  loadingMenus: boolean;
  onSearchChange: (value: string) => void;
  onAddToCart: (menu: Menu) => void;
};

export default function MenuList({
  menus,
  search,
  selectedVendor,
  loadingMenus,
  onSearchChange,
  onAddToCart,
}: MenuListProps) {
  return (
    <section className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-xs font-black text-[#7f1d1d]">
            <Utensils className="h-4 w-4" />
            {selectedVendor ? getVendorName(selectedVendor) : "Pilih vendor"}
          </div>

          <h2 className="text-2xl font-black text-gray-950">Daftar Menu</h2>

          <p className="mt-1 text-sm text-gray-500">
            Total menu ditampilkan: {menus.length}
          </p>
        </div>

        <div className="flex w-full items-center gap-3 rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 md:max-w-sm">
          <Search className="h-5 w-5 text-[#7f1d1d]" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari menu..."
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {loadingMenus ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="rounded-3xl bg-[#fff7f7] px-8 py-6 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#7f1d1d]/20 border-t-[#7f1d1d]" />
            <p className="text-sm font-bold text-[#7f1d1d]">
              Memuat menu...
            </p>
          </div>
        </div>
      ) : menus.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-[#7f1d1d]/20 bg-[#fff7f7]">
          <div className="text-center">
            <Utensils className="mx-auto mb-4 h-12 w-12 text-[#7f1d1d]" />
            <h3 className="text-lg font-black text-gray-950">
              Menu belum tersedia
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Pilih vendor lain atau coba refresh data.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {menus.map((menu) => (
            <MenuCard
              key={String(menu.id || menu.menuId || menu._id)}
              menu={menu}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
}