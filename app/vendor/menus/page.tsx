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
  imageUrl?: string | null;
  categoryId?: number;
  category?: {
    id?: number;
    name?: string;
    categoryName?: string;
  };
};

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

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
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

      const token = getCookie("accessToken");

      const res = await fetch(`${BASE_API_URL}/api/vendor/menus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("VENDOR MENUS:", data);

      if (!res.ok) {
        alert(data.message || "Gagal mengambil data menu");
        return;
      }

      setMenus(data.data || data.menus || data || []);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil data menu");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${BASE_API_URL}/api/menu-categories`);
      const data = await res.json();

      console.log("MENU CATEGORIES:", data);

      if (!res.ok) return;

      setCategories(data.data || data.categories || data || []);
    } catch (error) {
      console.error("Gagal mengambil kategori:", error);
    }
  }

  async function uploadMenuImage(menuId: number) {
    if (!imageFile) return;

    const token = getCookie("accessToken");

    const formData = new FormData();

    // Kalau nanti error "Unexpected field - file",
    // cek Swagger POST /api/vendor/menus/{id}/image,
    // bisa jadi field-nya "image".
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

      const token = getCookie("accessToken");

      // isAvailable DIHAPUS dari body karena backend tidak menerima field itu
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

  async function handleDelete(id: number) {
    const confirmDelete = confirm("Yakin ingin menghapus menu ini?");

    if (!confirmDelete) return;

    try {
      const token = getCookie("accessToken");

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

  function handleEdit(menu: MenuItem) {
    setEditingId(menu.id);
    setName(menu.name || menu.menuName || "");
    setDescription(menu.description || "");
    setPrice(String(menu.price || ""));
    setStock(String(menu.stock || ""));
    setCategoryId(String(menu.categoryId || menu.category?.id || ""));
    setImageFile(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <section className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Utensils size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Menu Makanan
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Tambah, edit, hapus, dan kelola menu vendor.
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              {editingId === null ? "Tambah Menu Baru" : "Edit Menu"}
            </h2>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                <X size={16} />
                Batal Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 lg:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Nama Menu
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Nasi Goreng"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Kategori
              </label>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
              >
                <option value="">Pilih kategori</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name ||
                      category.categoryName ||
                      `Kategori ${category.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Harga
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 10000"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Stok
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Contoh: 20"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Deskripsi
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Contoh: Nasi goreng dengan telur dan ayam."
                rows={4}
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none focus:border-red-500"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Gambar Menu
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border bg-white px-4 py-3 text-sm"
              />

              {imageFile && (
                <p className="mt-2 text-xs text-gray-500">
                  File dipilih: {imageFile.name}
                </p>
              )}
            </div>

            <div className="flex justify-end lg:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId === null ? <Plus size={18} /> : <Save size={18} />}
                {saving
                  ? "Menyimpan..."
                  : editingId === null
                    ? "Tambah Menu"
                    : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>

        {/* LIST MENU */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-lg font-bold text-gray-800">Daftar Menu</h2>

            <p className="mt-1 text-sm text-gray-500">
              Semua menu yang dimiliki vendor.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Mengambil data menu...
            </div>
          ) : menus.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Belum ada menu.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-left text-sm text-gray-600">
                    <th className="p-4">Gambar</th>
                    <th className="p-4">Nama Menu</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Harga</th>
                    <th className="p-4">Stok</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {menus.map((menu) => (
                    <tr
                      key={menu.id}
                      className="border-t text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <td className="p-4">
                        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-gray-50">
                          {menu.imageUrl ? (
                            <img
                              src={menu.imageUrl}
                              alt={menu.name || menu.menuName || "Menu"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Camera size={24} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <p className="font-semibold text-gray-800">
                          {menu.name || menu.menuName || "-"}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {menu.description || "-"}
                        </p>
                      </td>

                      <td className="p-4">
                        {menu.category?.name ||
                          menu.category?.categoryName ||
                          "-"}
                      </td>

                      <td className="p-4 font-semibold">
                        {formatRupiah(Number(menu.price || 0))}
                      </td>

                      <td className="p-4">{menu.stock ?? 0}</td>

                      <td className="p-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            menu.isAvailable === false
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {menu.isAvailable === false
                            ? "Tidak tersedia"
                            : "Tersedia"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(menu)}
                            className="inline-flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-600"
                          >
                            <Edit size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(menu.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}