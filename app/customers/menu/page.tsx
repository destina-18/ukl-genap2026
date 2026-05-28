"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  RefreshCcw,
  Search,
  Store,
  Utensils,
  ShoppingCart,
  Star,
} from "lucide-react";

type Vendor = {
  id?: number | string;
  vendorId?: number | string;
  _id?: number | string;
  canteenNumber?: number | string;
  canteenName?: string;
  name?: string;
  vendorName?: string;
  email?: string;
  logoUrl?: string;
  logo?: string;
  image?: string;
  description?: string;
  address?: string;
  isActive?: boolean;
  _count?: {
    menus?: number;
  };
  [key: string]: any;
};

type Menu = {
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

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function getArrayFromResponse(response: any) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;

  if (Array.isArray(response?.vendors)) return response.vendors;
  if (Array.isArray(response?.data?.vendors)) return response.data.vendors;

  if (Array.isArray(response?.menus)) return response.menus;
  if (Array.isArray(response?.data?.menus)) return response.data.menus;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.result)) return response.data.result;

  return [];
}

function getVendorId(vendor: Vendor) {
  return vendor.id || vendor.vendorId || vendor._id;
}

function getVendorName(vendor: Vendor) {
  return vendor.canteenName || vendor.name || vendor.vendorName || "Vendor";
}

function getVendorDescription(vendor: Vendor) {
  return (
    vendor.description ||
    vendor.address ||
    vendor.email ||
    `Kantin nomor ${vendor.canteenNumber || "-"}`
  );
}

function getVendorLogo(vendor: Vendor) {
  return vendor.logoUrl || vendor.logo || vendor.image || "";
}

function getMenuId(menu: Menu) {
  return menu.id || menu.menuId || menu._id;
}

function formatRupiah(value: number | string | undefined) {
  const numberValue = Number(value || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numberValue);
}

export default function CustomersMenuPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [search, setSearch] = useState("");

  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(false);

  async function getVendors() {
    try {
      setLoadingVendors(true);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      const response = await fetch(`${BASE_API_URL}/api/vendors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);
      console.log("CUSTOMER VENDORS RESPONSE:", data);

      if (!response.ok) {
        alert(data?.message || "Gagal mengambil data vendor");
        setVendors([]);
        return;
      }

      const vendorData: Vendor[] = getArrayFromResponse(data);
      setVendors(vendorData);

      if (vendorData.length > 0) {
        const firstVendorId = getVendorId(vendorData[0]);

        if (firstVendorId) {
          setSelectedVendorId(String(firstVendorId));
          await getMenusByVendor(String(firstVendorId));
        }
      }
    } catch (error) {
      console.error("GET VENDORS ERROR:", error);
      alert("Gagal terhubung ke server saat mengambil vendor");
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }

  async function getMenusByVendor(vendorId: string) {
    try {
      setLoadingMenus(true);
      setMenus([]);

      const token =
        getCookie("accessToken") || localStorage.getItem("accessToken");

      const response = await fetch(
        `${BASE_API_URL}/api/vendors/${vendorId}/menus`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        }
      );

      const data = await response.json().catch(() => null);
      console.log(`MENUS VENDOR ${vendorId} RESPONSE:`, data);

      if (!response.ok) {
        alert(data?.message || "Gagal mengambil menu vendor");
        setMenus([]);
        return;
      }

      setMenus(getArrayFromResponse(data));
    } catch (error) {
      console.error("GET MENUS ERROR:", error);
      alert("Gagal terhubung ke server saat mengambil menu");
      setMenus([]);
    } finally {
      setLoadingMenus(false);
    }
  }

  function handleSelectVendor(vendorId: string) {
    setSelectedVendorId(vendorId);
    getMenusByVendor(vendorId);
  }

  function handleAddToCart(menu: Menu) {
    const menuId = getMenuId(menu);

    if (!menuId) {
      alert("ID menu tidak ditemukan");
      return;
    }

    const currentCart = localStorage.getItem("cart");
    const cartItems = currentCart ? JSON.parse(currentCart) : [];

    const existingItemIndex = cartItems.findIndex(
      (item: any) => String(item.id) === String(menuId)
    );

    if (existingItemIndex >= 0) {
      cartItems[existingItemIndex].quantity += 1;
    } else {
      cartItems.push({
        id: menuId,
        name: menu.name || menu.menuName || "Menu",
        price: Number(menu.price || 0),
        image: menu.imageUrl || menu.image || "",
        vendorId: selectedVendorId,
        quantity: 1,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cartItems));
    alert("Menu berhasil ditambahkan ke keranjang");
  }

  const selectedVendor = vendors.find(
    (vendor) => String(getVendorId(vendor)) === String(selectedVendorId)
  );

  const filteredMenus = useMemo(() => {
    const keyword = search.toLowerCase();

    return menus.filter((menu) => {
      const name = String(menu.name || menu.menuName || "").toLowerCase();
      const description = String(menu.description || "").toLowerCase();
      const category = String(menu.category?.name || "").toLowerCase();

      return (
        name.includes(keyword) ||
        description.includes(keyword) ||
        category.includes(keyword)
      );
    });
  }, [menus, search]);

  useEffect(() => {
    getVendors();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/customers/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Link>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Menu Kantin
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Pilih vendor kantin, lihat menu yang tersedia, lalu tambahkan ke
                keranjang.
              </p>
            </div>

            <button
              onClick={getVendors}
              disabled={loadingVendors || loadingMenus}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw
                className={`h-4 w-4 ${
                  loadingVendors || loadingMenus ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                <Store className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-black text-gray-950">
                  Pilih Vendor
                </h2>
                <p className="text-sm text-gray-500">
                  Total vendor: {vendors.length}
                </p>
              </div>
            </div>

            {loadingVendors ? (
              <div className="rounded-2xl bg-[#fff7f7] p-4 text-sm font-bold text-[#7f1d1d]">
                Memuat vendor...
              </div>
            ) : vendors.length === 0 ? (
              <div className="rounded-2xl bg-[#fff7f7] p-4 text-sm text-gray-500">
                Belum ada vendor aktif.
              </div>
            ) : (
              <div className="space-y-3">
                {vendors.map((vendor) => {
                  const vendorId = getVendorId(vendor);
                  const vendorLogo = getVendorLogo(vendor);
                  const isActive = String(vendorId) === String(selectedVendorId);

                  return (
                    <button
                      key={String(vendorId)}
                      onClick={() => handleSelectVendor(String(vendorId))}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? "border-[#7f1d1d] bg-[#7f1d1d] text-white shadow-lg shadow-red-900/20"
                          : "border-[#7f1d1d]/10 bg-white text-gray-700 hover:bg-[#fff7f7]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                            isActive
                              ? "bg-white/15 text-white"
                              : "bg-[#7f1d1d]/10 text-[#7f1d1d]"
                          }`}
                        >
                          {vendorLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={vendorLogo}
                              alt={getVendorName(vendor)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Store className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">
                            {getVendorName(vendor)}
                          </p>

                          <p
                            className={`mt-1 truncate text-xs ${
                              isActive ? "text-red-100" : "text-gray-500"
                            }`}
                          >
                            {getVendorDescription(vendor)}
                          </p>

                          <p
                            className={`mt-1 text-xs font-bold ${
                              isActive ? "text-red-100" : "text-[#7f1d1d]"
                            }`}
                          >
                            {vendor._count?.menus || 0} menu
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          <section className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#7f1d1d]/10 px-4 py-2 text-xs font-black text-[#7f1d1d]">
                  <Utensils className="h-4 w-4" />
                  {selectedVendor
                    ? getVendorName(selectedVendor)
                    : "Pilih vendor"}
                </div>

                <h2 className="text-2xl font-black text-gray-950">
                  Daftar Menu
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Total menu ditampilkan: {filteredMenus.length}
                </p>
              </div>

              <div className="flex w-full items-center gap-3 rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 md:max-w-sm">
                <Search className="h-5 w-5 text-[#7f1d1d]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
            ) : filteredMenus.length === 0 ? (
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
                {filteredMenus.map((menu) => {
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
                            <p className="text-xs font-bold text-gray-400">
                              Harga
                            </p>
                            <p className="text-lg font-black text-[#7f1d1d]">
                              {formatRupiah(menu.price)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleAddToCart(menu)}
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
                })}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}