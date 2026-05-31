"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import VendorList, {
  type Vendor,
  getVendorId,
} from "./vendor-list";

import MenuList from "./menu-list";
import { type Menu, getMenuId } from "./menu-card";

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
              type="button"
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
          <VendorList
            vendors={vendors}
            selectedVendorId={selectedVendorId}
            loadingVendors={loadingVendors}
            onSelectVendor={handleSelectVendor}
          />

          <MenuList
            menus={filteredMenus}
            search={search}
            selectedVendor={selectedVendor}
            loadingMenus={loadingMenus}
            onSearchChange={setSearch}
            onAddToCart={handleAddToCart}
          />
        </section>
      </div>
    </main>
  );
}