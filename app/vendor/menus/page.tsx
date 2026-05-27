"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Camera,
  Edit,
  Plus,
  Save,
  Trash2,
  Utensils,
  X,
  RefreshCcw,
  Power,
  PowerOff,
} from "lucide-react";

type Category = {
  id: number;
  name?: string;
  categoryName?: string;
};

type MenuItem = {
  id: number;
  name?: string;
  menuName?: string;
  description?: string;
  price?: number;
  stock?: number;
  isAvailable?: boolean;
  is_available?: boolean;
  imageUrl?: string | null;
  image_url?: string | null;
  categoryId?: number;
  category_id?: number;
  category?: {
    id?: number;
    name?: string;
    categoryName?: string;
  };
};

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

export default function VendorMenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

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

  function getMenuName(menu: MenuItem) {
    return menu.name || menu.menuName || "-";
  }

  function getCategoryName(menu: MenuItem) {
    return menu.category?.name || menu.category?.categoryName || "-";
  }

  function getMenuCategoryId(menu: MenuItem) {
    return menu.categoryId || menu.category_id || menu.category?.id || 0;
  }

  function getImageUrl(menu: MenuItem) {
    const image = menu.imageUrl || menu.image_url || "";

    if (!image) return "";

    if (image.startsWith("http")) return image;

    return `${BASE_API_URL}${image}`;
  }

  function getMenuAvailable(menu: MenuItem) {
    if (typeof menu.isAvailable === "boolean") return menu.isAvailable;
    if (typeof menu.is_available === "boolean") return menu.is_available;

    return Number(menu.stock || 0) > 0;
  }

  function resetForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategoryId("");
    setImageFile(null);
  }

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

  async function uploadMenuImage(menuId: number) {
    if (!imageFile) return;

    const token = getToken();

    const formData = new FormData();

    // Kalau BE kamu pakai field "image", ganti "file" jadi "image".
    formData.append("file", imageFile);

    const res = await fetch(`${BASE_API_URL}/api/vendor/menus/${menuId}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();
    console.log("UPLOAD MENU IMAGE:", data);

    if (!res.ok) {
      alert(data.message || "Menu berhasil disimpan, tapi gambar gagal upload");
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !price || !stock || !categoryId) {
      alert("Nama, harga, stok, dan kategori wajib diisi");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const body = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId: Number(categoryId),
      };

      const url =
        editingId === null
          ? `${BASE_API_URL}/api/vendor/menus`
          : `${BASE_API_URL}/api/vendor/menus/${editingId}`;

      const method = editingId === null ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("SAVE MENU:", data);

      if (!res.ok) {
        alert(data.message || "Gagal menyimpan menu");
        return;
      }

      const savedMenu = data.data || data.menu || data;
      const menuId = savedMenu.id || editingId;

      if (menuId && imageFile) {
        await uploadMenuImage(menuId);
      }

      alert(
        editingId === null
          ? "Menu berhasil ditambahkan"
          : "Menu berhasil diupdate"
      );

      resetForm();
      fetchMenus();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan menu");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(menu: MenuItem) {
    setEditingId(menu.id);
    setName(getMenuName(menu) === "-" ? "" : getMenuName(menu));
    setDescription(menu.description || "");
    setPrice(String(menu.price || ""));
    setStock(String(menu.stock || 0));
    setCategoryId(String(getMenuCategoryId(menu) || ""));
    setImageFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleToggleAvailable(menu: MenuItem) {
    const currentAvailable = getMenuAvailable(menu);
    const nextAvailable = !currentAvailable;

    const confirmChange = confirm(
      nextAvailable
        ? "Yakin ingin mengaktifkan menu ini?"
        : "Yakin ingin menonaktifkan menu ini?"
    );

    if (!confirmChange) return;

    try {
      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const baseBody = {
        name: getMenuName(menu),
        description: menu.description || "",
        price: Number(menu.price || 0),
        stock: nextAvailable
          ? Number(menu.stock || 1) <= 0
            ? 1
            : Number(menu.stock || 1)
          : 0,
        categoryId: getMenuCategoryId(menu),
      };

      // Percobaan 1: sesuai keterangan Swagger "ketersediaan"
      // Kalau BE menerima isAvailable, ini berhasil.
      let res = await fetch(`${BASE_API_URL}/api/vendor/menus/${menu.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...baseBody,
          isAvailable: nextAvailable,
        }),
      });

      let data = await res.json();
      console.log("TOGGLE MENU RESPONSE 1:", data);

      // Fallback kalau BE menolak field isAvailable
      if (!res.ok && JSON.stringify(data).includes("isAvailable")) {
        res = await fetch(`${BASE_API_URL}/api/vendor/menus/${menu.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(baseBody),
        });

        data = await res.json();
        console.log("TOGGLE MENU RESPONSE 2:", data);
      }

      if (!res.ok) {
        alert(data.message || "Gagal mengubah status menu");
        return;
      }

      alert(nextAvailable ? "Menu berhasil diaktifkan" : "Menu berhasil dinonaktifkan");

      fetchMenus();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengubah status menu");
    }
  }

  async function handleDelete(id: number) {
    const confirmDelete = confirm(
      "Yakin ingin menghapus menu ini? Data akan dihapus secara soft delete."
    );

    if (!confirmDelete) return;

    try {
      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai vendor.");
        return;
      }

      const res = await fetch(`${BASE_API_URL}/api/vendor/menus/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("DELETE MENU:", data);

      if (!res.ok) {
        alert(data.message || "Gagal menghapus menu");
        return;
      }

      alert("Menu berhasil dihapus");
      fetchMenus();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menghapus menu");
    }
  }

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Utensils className="h-4 w-4" />
                Vendor Menu
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Menu Makanan
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Tambah menu, edit harga dan stok, upload gambar, serta aktifkan
                atau nonaktifkan menu.
              </p>
            </div>

            <button
              onClick={fetchMenus}
              disabled={loading}
              className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </section>

        <section className="mb-8 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-xl shadow-red-900/5">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-950">
                {editingId ? "Edit Menu" : "Tambah Menu Baru"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Data menu dikirim ke endpoint vendor sesuai struktur backend.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-100 px-4 py-2 text-sm font-black text-[#7f1d1d]"
              >
                <X size={16} />
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Nama Menu
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Nasi Goreng"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm outline-none focus:border-[#7f1d1d] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Kategori
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm outline-none focus:border-[#7f1d1d] focus:bg-white"
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name || category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Harga
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 12000"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm outline-none focus:border-[#7f1d1d] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-gray-700">
                  Stok
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Contoh: 20"
                  className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm outline-none focus:border-[#7f1d1d] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-gray-700">
                Deskripsi
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Nasi goreng dengan telur dan ayam."
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm outline-none focus:border-[#7f1d1d] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-gray-700">
                Gambar Menu
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[#7f1d1d] file:px-4 file:py-1 file:text-sm file:font-bold file:text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId ? <Save size={18} /> : <Plus size={18} />}
                {saving
                  ? "Menyimpan..."
                  : editingId
                  ? "Simpan Perubahan"
                  : "Tambah Menu"}
              </button>
            </div>
          </form>
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
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse">
                <thead>
                  <tr className="bg-[#fff7f7] text-left text-sm">
                    <th className="p-4 font-black text-[#7f1d1d]">Gambar</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Nama Menu</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Kategori</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Harga</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Stok</th>
                    <th className="p-4 font-black text-[#7f1d1d]">Status</th>
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
                            <button
                              onClick={() => handleEdit(menu)}
                              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-xs font-black text-white hover:bg-yellow-600"
                            >
                              <Edit size={15} />
                              Edit
                            </button>

                            <button
                              onClick={() => handleToggleAvailable(menu)}
                              className={
                                available
                                  ? "inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-2 text-xs font-black text-[#7f1d1d] hover:bg-red-200"
                                  : "inline-flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-xs font-black text-green-700 hover:bg-green-200"
                              }
                            >
                              {available ? (
                                <PowerOff size={15} />
                              ) : (
                                <Power size={15} />
                              )}
                              {available ? "Nonaktifkan" : "Aktifkan"}
                            </button>

                            <button
                              onClick={() => handleDelete(menu.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-4 py-2 text-xs font-black text-white hover:opacity-90"
                            >
                              <Trash2 size={15} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}