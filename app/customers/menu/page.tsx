"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCcw, SlidersHorizontal } from "lucide-react";

import VendorList, { type Vendor, getVendorId } from "./vendor-list";
import MenuList from "./menu-list";
import { type Menu, getMenuId } from "./menu-card";

type FilterCategory = "ALL" | "MAKANAN" | "MINUMAN";

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

function getMenuName(menu: any) {
  return String(menu?.name || menu?.menuName || menu?.menu_name || menu?.title || "");
}

function getMenuCategoryName(menu: any) {
  return String(
    menu?.category?.name ||
      menu?.category?.categoryName ||
      menu?.category?.title ||
      menu?.category ||
      menu?.menuCategory ||
      menu?.menu_category ||
      menu?.type ||
      ""
  );
}

function getMenuFilterCategory(menu: any): "MAKANAN" | "MINUMAN" {
  const rawCategory = getMenuCategoryName(menu).toUpperCase();

  if (
    rawCategory.includes("MINUMAN") ||
    rawCategory.includes("DRINK") ||
    rawCategory.includes("BEVERAGE")
  ) {
    return "MINUMAN";
  }

  if (
    rawCategory.includes("MAKANAN") ||
    rawCategory.includes("FOOD") ||
    rawCategory.includes("MEAL")
  ) {
    return "MAKANAN";
  }

  const menuName = getMenuName(menu).toLowerCase();

  const drinkKeywords = [
    "es",
    "teh",
    "kopi",
    "susu",
    "jus",
    "juice",
    "air",
    "minum",
    "drink",
    "latte",
    "coklat",
    "matcha",
    "boba",
    "thai tea",
    "lemon tea",
    "jeruk",
    "milo",
    "pop ice",
    "aqua",
  ];

  const isDrink = drinkKeywords.some((keyword) => menuName.includes(keyword));

  return isDrink ? "MINUMAN" : "MAKANAN";
}

function FilterButtons({
  selectedCategory,
  onChange,
  variant = "mobile",
}: {
  selectedCategory: FilterCategory;
  onChange: (category: FilterCategory) => void;
  variant?: "mobile" | "desktop";
}) {
  const categories: { label: string; value: FilterCategory }[] = [
    { label: "Semua", value: "ALL" },
    { label: "Makanan", value: "MAKANAN" },
    { label: "Minuman", value: "MINUMAN" },
  ];

  if (variant === "desktop") {
    return (
      <div className="hidden items-center gap-2 rounded-full border border-[#7f1d1d]/10 bg-[#fff7f7] p-1 lg:flex">
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            onClick={() => onChange(category.value)}
            className={`rounded-full px-5 py-2 text-sm font-black transition ${
              selectedCategory === category.value
                ? "bg-[#7f1d1d] text-white shadow-md shadow-red-900/20"
                : "text-[#7f1d1d] hover:bg-white"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category.value}
          type="button"
          onClick={() => onChange(category.value)}
          className={`rounded-full px-5 py-2 text-sm font-black transition ${
            selectedCategory === category.value
              ? "bg-[#7f1d1d] text-white shadow-md shadow-red-900/20"
              : "border border-[#7f1d1d]/20 bg-white text-[#7f1d1d] hover:bg-[#fff7f7]"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

export default function CustomersMenuPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("ALL");

  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingMenus, setLoadingMenus] = useState(false);

  async function getVendors() {
    try {
      setLoadingVendors(true);

      const token = getCookie("accessToken") || localStorage.getItem("accessToken");

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

      const token = getCookie("accessToken") || localStorage.getItem("accessToken");

      const response = await fetch(`${BASE_API_URL}/api/vendors/${vendorId}/menus`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

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
    setSelectedCategory("ALL");
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

    return menus.filter((menu: any) => {
      const name = getMenuName(menu).toLowerCase();
      const description = String(menu.description || "").toLowerCase();
      const category = getMenuCategoryName(menu).toLowerCase();

      const matchSearch =
        name.includes(keyword) ||
        description.includes(keyword) ||
        category.includes(keyword);

      const matchCategory =
        selectedCategory === "ALL" || getMenuFilterCategory(menu) === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [menus, search, selectedCategory]);

  useEffect(() => {
    getVendors();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff7f7] px-3 py-4 text-gray-900 sm:px-5 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        <section className="mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-5 text-white shadow-2xl shadow-red-900/20 sm:p-6 md:mb-8 md:rounded-[2rem] md:p-9">
          <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <Link
                href="/customers/dashboard"
                className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-red-50 backdrop-blur transition hover:bg-white/20 sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="truncate">Kembali ke Dashboard</span>
              </Link>

              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-5xl">
                Menu Kantin
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Pilih vendor kantin, lihat menu yang tersedia, lalu tambahkan ke
                keranjang.
              </p>
            </div>

            <button
              type="button"
              onClick={getVendors}
              disabled={loadingVendors || loadingMenus}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 md:w-fit"
            >
              <RefreshCcw
                className={`h-4 w-4 shrink-0 ${
                  loadingVendors || loadingMenus ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="min-w-0">
            <VendorList
              vendors={vendors}
              selectedVendorId={selectedVendorId}
              loadingVendors={loadingVendors}
              onSelectVendor={handleSelectVendor}
            />
          </div>

          <div className="min-w-0">
            {/* MOBILE FILTER - tetap seperti sekarang */}
            <div className="mb-5 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-4 shadow-sm lg:hidden">
              <p className="mb-3 text-sm font-black text-gray-800">
                Filter kategori
              </p>

              <FilterButtons
                selectedCategory={selectedCategory}
                onChange={setSelectedCategory}
                variant="mobile"
              />
            </div>

            {/* DESKTOP FILTER - dibuat lebih clean dan menarik */}
            <div className="mb-5 hidden rounded-[2rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5 lg:block">
              <div className="flex items-center justify-between gap-5">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                      <SlidersHorizontal className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-gray-950">
                        Jelajahi Menu
                      </h2>
                      <p className="text-sm font-medium text-gray-500">
                        Filter berdasarkan kategori makanan atau minuman.
                      </p>
                    </div>
                  </div>
                </div>

                <FilterButtons
                  selectedCategory={selectedCategory}
                  onChange={setSelectedCategory}
                  variant="desktop"
                />
              </div>
            </div>

            <MenuList
              menus={filteredMenus}
              search={search}
              selectedVendor={selectedVendor}
              loadingMenus={loadingMenus}
              onSearchChange={setSearch}
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>
      </div>
    </main>
  );
}