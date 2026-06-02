"use client";

import { useEffect, useState } from "react";
import { Camera, RefreshCcw, Utensils } from "lucide-react";
import AddMenu from "./add";
import EditMenu from "./edit";
import DeleteMenu from "./delete";
import ToggleMenuStatus from "./toggle-status";

function getArrayFromResponse(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.menus)) return response.menus;
  if (Array.isArray(response?.data?.menus)) return response.data.menus;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.data?.categories)) return response.data.categories;
  if (Array.isArray(response?.items)) return response.items;

  return [];
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

function getToken() {
  return getCookie("accessToken") || getCookie("accesstoken");
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function getMenuName(menu: any) {
  return menu.name || menu.menuName || "-";
}

function getCategoryName(menu: any) {
  return menu.category?.name || menu.category?.categoryName || "-";
}

function getImageUrl(menu: any) {
  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;
  const image = menu.imageUrl || menu.image_url || "";

  if (!image) return "";
  if (image.startsWith("http")) return image;

  return `${BASE_API_URL}${image}`;
}

function getMenuAvailable(menu: any) {
  if (typeof menu.isAvailable === "boolean") return menu.isAvailable;
  if (typeof menu.is_available === "boolean") return menu.is_available;

  return Number(menu.stock || 0) > 0;
}

export default function VendorMenusPage() {
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

  async function fetchMenus() {
    try {
      setLoading(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const res = await fetch(`${BASE_API_URL}/api/vendor/menus`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();
      console.log("VENDOR MENUS:", data);

      if (!res.ok) {
        alert(data.message || "Gagal mengambil data menu");
        setMenus([]);
        return;
      }

      setMenus(getArrayFromResponse(data));
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil data menu");
      setMenus([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      if (!BASE_API_URL) return;

      const res = await fetch(`${BASE_API_URL}/api/menu-categories`, {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();
      console.log("MENU CATEGORIES:", data);

      if (!res.ok) return;

      setCategories(getArrayFromResponse(data));
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  }

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fff7f7] px-3 py-4 text-gray-900 sm:px-5 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-7xl">
        <section className="mb-5 overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-5 text-white shadow-2xl shadow-red-900/20 sm:p-6 md:mb-8 md:rounded-[2rem] md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-red-50 backdrop-blur sm:text-sm">
                <Utensils className="h-4 w-4 shrink-0" />
                Vendor Menu
              </div>

              <h1 className="break-words text-2xl font-black tracking-tight sm:text-3xl md:text-4xl">
                Menu Makanan
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Tambah menu, edit harga dan stok, upload gambar, serta aktifkan
                atau nonaktifkan menu.
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
              <div className="w-full [&>*]:w-full">
                <AddMenu categories={categories} onSuccess={fetchMenus} />
              </div>

              <button
                onClick={fetchMenus}
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
          <div className="border-b border-[#7f1d1d]/10 bg-white p-5">
            <h2 className="text-lg font-black text-gray-950">Daftar Menu</h2>
            <p className="mt-1 text-sm text-gray-500">
              Semua menu yang dimiliki vendor.
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Mengambil data menu...
            </div>
          ) : menus.length === 0 ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Belum ada menu.
            </div>
          ) : (
            <>
              {/* MOBILE CARD */}
              <div className="grid gap-4 p-4 md:hidden">
                {menus.map((menu) => {
                  const available = getMenuAvailable(menu);
                  const image = getImageUrl(menu);

                  return (
                    <div
                      key={menu.id}
                      className="overflow-hidden rounded-2xl border border-[#7f1d1d]/10 bg-[#fffafa] shadow-sm"
                    >
                      <div className="flex gap-4 p-4">
                        <div className="shrink-0">
                          {image ? (
                            <img
                              src={image}
                              alt={getMenuName(menu)}
                              className="h-20 w-20 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                              <Camera size={24} />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2">
                            <h3 className="break-words text-base font-black text-gray-950">
                              {getMenuName(menu)}
                            </h3>

                            <span
                              className={
                                available
                                  ? "w-fit rounded-full bg-green-100 px-3 py-1 text-[11px] font-black text-green-700"
                                  : "w-fit rounded-full bg-red-100 px-3 py-1 text-[11px] font-black text-[#7f1d1d]"
                              }
                            >
                              {available ? "Tersedia" : "Tidak tersedia"}
                            </span>
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                            {menu.description || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-[#7f1d1d]/10 px-4 py-3 text-sm">
                        <div>
                          <p className="text-xs font-semibold text-gray-400">
                            Kategori
                          </p>
                          <p className="mt-1 font-bold text-gray-700">
                            {getCategoryName(menu)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-400">
                            Stok
                          </p>
                          <p className="mt-1 font-bold text-gray-700">
                            {menu.stock ?? 0}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs font-semibold text-gray-400">
                            Harga
                          </p>
                          <p className="mt-1 font-black text-[#7f1d1d]">
                            {formatRupiah(Number(menu.price || 0))}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 border-t border-[#7f1d1d]/10 p-4">
                        <div className="w-fit">
                          <EditMenu
                            menu={menu}
                            categories={categories}
                            onSuccess={fetchMenus}
                          />
                        </div>

                        <div className="w-fit">
                          <ToggleMenuStatus
                            menu={menu}
                            onSuccess={fetchMenus}
                          />
                        </div>

                        <div className="w-fit">
                          <DeleteMenu
                            menuId={menu.id}
                            onSuccess={fetchMenus}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden w-full overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="bg-[#fff7f7] text-left text-sm">
                      <th className="p-4 font-black text-[#7f1d1d]">
                        Gambar
                      </th>
                      <th className="p-4 font-black text-[#7f1d1d]">
                        Nama Menu
                      </th>
                      <th className="p-4 font-black text-[#7f1d1d]">
                        Kategori
                      </th>
                      <th className="p-4 font-black text-[#7f1d1d]">Harga</th>
                      <th className="p-4 font-black text-[#7f1d1d]">Stok</th>
                      <th className="p-4 font-black text-[#7f1d1d]">
                        Status
                      </th>
                      <th className="p-4 text-center font-black text-[#7f1d1d]">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {menus.map((menu) => {
                      const available = getMenuAvailable(menu);
                      const image = getImageUrl(menu);

                      return (
                        <tr
                          key={menu.id}
                          className="border-t border-[#7f1d1d]/10 text-sm hover:bg-[#fff7f7]"
                        >
                          <td className="p-4">
                            {image ? (
                              <img
                                src={image}
                                alt={getMenuName(menu)}
                                className="h-16 w-16 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
                                <Camera size={22} />
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <p className="font-black text-gray-950">
                              {getMenuName(menu)}
                            </p>
                            <p className="mt-1 max-w-[320px] text-xs leading-5 text-gray-500">
                              {menu.description || "-"}
                            </p>
                          </td>

                          <td className="p-4 font-medium text-gray-600">
                            {getCategoryName(menu)}
                          </td>

                          <td className="p-4 font-black text-gray-800">
                            {formatRupiah(Number(menu.price || 0))}
                          </td>

                          <td className="p-4 font-medium text-gray-600">
                            {menu.stock ?? 0}
                          </td>

                          <td className="p-4">
                            <span
                              className={
                                available
                                  ? "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"
                                  : "rounded-full bg-red-100 px-3 py-1 text-xs font-black text-[#7f1d1d]"
                              }
                            >
                              {available ? "Tersedia" : "Tidak tersedia"}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              <EditMenu
                                menu={menu}
                                categories={categories}
                                onSuccess={fetchMenus}
                              />

                              <ToggleMenuStatus
                                menu={menu}
                                onSuccess={fetchMenus}
                              />

                              <DeleteMenu
                                menuId={menu.id}
                                onSuccess={fetchMenus}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}