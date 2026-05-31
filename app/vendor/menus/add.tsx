"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";

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

export default function AddMenu({
  categories,
  onSuccess,
}: {
  categories: any[];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setCategoryId("");
    setImageFile(null);
  }

  async function uploadMenuImage(menuId: number) {
    if (!imageFile) return;

    const token = getToken();
    const formData = new FormData();

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
      alert(
        data.message || "Menu berhasil ditambahkan, tapi gambar gagal diupload"
      );
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name || !price || !stock || !categoryId) {
      alert("Nama menu, harga, stok, dan kategori wajib diisi");
      return;
    }

    try {
      setSaving(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

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

      const res = await fetch(`${BASE_API_URL}/api/vendor/menus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("ADD MENU:", data);

      if (!res.ok) {
        alert(data.message || "Gagal menambahkan menu");
        return;
      }

      const savedMenu = data.data || data.menu || data;
      const menuId = savedMenu.id;

      if (menuId && imageFile) {
        await uploadMenuImage(menuId);
      }

      alert("Menu berhasil ditambahkan");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menambahkan menu");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105"
      >
        <Plus size={16} />
        Tambah Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-950">
                  Tambah Menu Baru
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Isi data menu sesuai backend vendor.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-red-100 p-2 text-[#7f1d1d] transition hover:bg-red-200"
              >
                <X size={18} />
              </button>
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
                    className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7f1d1d]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-gray-700">
                    Kategori
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#7f1d1d]"
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
                    value={price}
                    onChange={(e) =>
                      setPrice(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Contoh: 12000"
                    className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7f1d1d]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-gray-700">
                    Stok
                  </label>
                  <input
                    value={stock}
                    onChange={(e) =>
                      setStock(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Contoh: 20"
                    className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7f1d1d]"
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
                  className="w-full resize-none rounded-2xl border border-[#7f1d1d]/20 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#7f1d1d]"
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
                  className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-4 py-3 text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-[#7f1d1d] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl bg-gray-100 px-5 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-200"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-6 py-3 text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={18} />
                  {saving ? "Menyimpan..." : "Tambah Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}