"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Search,
  Power,
  PowerOff,
  Store,
  RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Vendor = {
  id: number;

  email?: string;
  name?: string;
  whatsappNumber?: string;
  whatsapp_number?: string;

  canteenNumber?: number;
  canteen_number?: number;
  canteenName?: string;
  canteen_name?: string;

  description?: string;

  isActive?: boolean;
  is_active?: boolean;

  logo?: string;
  logoUrl?: string;
  logo_url?: string;

  createdAt?: string;
  created_at?: string;

  user?: {
    id?: number;
    name?: string;
    email?: string;
    whatsappNumber?: string;
    whatsapp_number?: string;
  };
};

type ApiResponse = {
  data?: any;
  id?: number;
  vendor?: Vendor;
  message?: string;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [open, setOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("");
  const [canteenNumber, setCanteenNumber] = useState<number>(1);
  const [canteenName, setCanteenName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
    return getCookie("accesstoken") || getCookie("accessToken");
  }

  function getVendorName(vendor: Vendor) {
    return vendor.name || vendor.user?.name || "-";
  }

  function getVendorEmail(vendor: Vendor) {
    return vendor.email || vendor.user?.email || "-";
  }

  function getVendorWhatsapp(vendor: Vendor) {
    return (
      vendor.whatsappNumber ||
      vendor.whatsapp_number ||
      vendor.user?.whatsappNumber ||
      vendor.user?.whatsapp_number ||
      "-"
    );
  }

  function getCanteenNumber(vendor: Vendor) {
    return vendor.canteenNumber || vendor.canteen_number || "-";
  }

  function getCanteenName(vendor: Vendor) {
    return vendor.canteenName || vendor.canteen_name || "-";
  }

  function getLogo(vendor: Vendor) {
    return vendor.logoUrl || vendor.logo_url || vendor.logo || "";
  }

  function getIsActive(vendor: Vendor) {
    return vendor.isActive !== false && vendor.is_active !== false;
  }

  function resetForm() {
    setEditId(null);
    setEmail("");
    setPassword("");
    setName("");
    setWhatsappNumber("");
    setCanteenNumber(1);
    setCanteenName("");
    setDescription("");
    setLogoFile(null);
  }

  function getCreatedVendorId(data: ApiResponse) {
    return (
      data?.data?.id ||
      data?.data?.vendor?.id ||
      data?.vendor?.id ||
      data?.id ||
      null
    );
  }

  async function uploadLogo(vendorId: number, file: File) {
    if (!BASE_API_URL) {
      alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
      return false;
    }

    const token = getToken();

    if (!token) {
      alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
      return false;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${BASE_API_URL}/api/admin/vendors/${vendorId}/logo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Gagal upload logo vendor");
      return false;
    }

    return true;
  }

  async function fetchVendors() {
    try {
      setLoading(true);

      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
        return;
      }

      const res = await fetch(`${BASE_API_URL}/api/admin/vendors`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengambil data vendor");
        return;
      }

      setVendors(data.data || data || []);
    } catch (error) {
      console.error("FETCH VENDORS ERROR:", error);
      alert("Terjadi kesalahan saat mengambil data vendor");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
        return;
      }

      const url = editId
        ? `${BASE_API_URL}/api/admin/vendors/${editId}`
        : `${BASE_API_URL}/api/admin/vendors`;

      const method = editId ? "PATCH" : "POST";

      const body = editId
        ? {
            canteenName,
            canteenNumber,
            description,
            isActive: true,
            name,
            whatsappNumber,
          }
        : {
            email,
            password,
            name,
            whatsappNumber,
            canteenNumber,
            canteenName,
            description,
          };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menyimpan data vendor");
        return;
      }

      if (logoFile) {
        if (editId) {
          await uploadLogo(editId, logoFile);
        } else {
          const createdVendorId = getCreatedVendorId(data);

          if (createdVendorId) {
            await uploadLogo(createdVendorId, logoFile);
          } else {
            alert(
              "Vendor berhasil ditambahkan, tapi logo belum bisa diupload karena ID vendor tidak ditemukan dari response backend."
            );
          }
        }
      }

      alert(editId ? "Vendor berhasil diupdate" : "Vendor berhasil ditambahkan");

      resetForm();
      setOpen(false);
      fetchVendors();
    } catch (error) {
      console.error("SUBMIT VENDOR ERROR:", error);
      alert("Terjadi kesalahan saat menyimpan data vendor");
    }
  }

  function handleEdit(vendor: Vendor) {
    setEditId(vendor.id);
    setEmail(getVendorEmail(vendor) === "-" ? "" : getVendorEmail(vendor));
    setPassword("");
    setName(getVendorName(vendor) === "-" ? "" : getVendorName(vendor));
    setWhatsappNumber(
      getVendorWhatsapp(vendor) === "-" ? "" : getVendorWhatsapp(vendor)
    );
    setCanteenNumber(Number(getCanteenNumber(vendor)) || 1);
    setCanteenName(
      getCanteenName(vendor) === "-" ? "" : getCanteenName(vendor)
    );
    setDescription(vendor.description || "");
    setLogoFile(null);
    setOpen(true);
  }

  async function handleToggleActive(vendor: Vendor) {
    const isActive = getIsActive(vendor);
    const newStatus = !isActive;

    const confirmChange = confirm(
      newStatus
        ? "Yakin ingin mengaktifkan vendor ini?"
        : "Yakin ingin menonaktifkan vendor ini?"
    );

    if (!confirmChange) return;

    try {
      if (!BASE_API_URL) {
        alert("NEXT_PUBLIC_BASE_API_URL belum diisi");
        return;
      }

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang sebagai admin.");
        return;
      }

      const res = await fetch(`${BASE_API_URL}/api/admin/vendors/${vendor.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          canteenName:
            getCanteenName(vendor) === "-" ? "" : getCanteenName(vendor),
          canteenNumber:
            Number(getCanteenNumber(vendor)) || vendor.canteenNumber || 1,
          description: vendor.description || "",
          isActive: newStatus,
          name: getVendorName(vendor) === "-" ? "" : getVendorName(vendor),
          whatsappNumber:
            getVendorWhatsapp(vendor) === "-" ? "" : getVendorWhatsapp(vendor),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengubah status vendor");
        return;
      }

      alert(
        newStatus
          ? "Vendor berhasil diaktifkan"
          : "Vendor berhasil dinonaktifkan"
      );

      fetchVendors();
    } catch (error) {
      console.error("TOGGLE ACTIVE ERROR:", error);
      alert("Terjadi kesalahan saat mengubah status vendor");
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter((vendor) => {
    const keyword = search.toLowerCase();

    return (
      getVendorName(vendor).toLowerCase().includes(keyword) ||
      getVendorEmail(vendor).toLowerCase().includes(keyword) ||
      getVendorWhatsapp(vendor).toLowerCase().includes(keyword) ||
      getCanteenName(vendor).toLowerCase().includes(keyword)
    );
  });

  const activeVendors = vendors.filter((vendor) => getIsActive(vendor)).length;
  const inactiveVendors = vendors.length - activeVendors;

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#7f1d1d]/20 blur-3xl" />
        <div className="absolute right-[-140px] top-[120px] h-[480px] w-[480px] rounded-full bg-[#991b1b]/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <section className="mb-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Store className="h-4 w-4" />
                Vendor Management
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                Data Vendor
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                Kelola akun vendor kantin, data pemilik, nomor kantin, logo,
                dan status aktif vendor.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchVendors}
                disabled={loading}
                className="flex w-fit items-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <RefreshCcw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={resetForm}
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 hover:bg-white"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Vendor
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[2rem] border-[#7f1d1d]/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-[#7f1d1d]">
                      {editId ? "Edit Vendor" : "Tambah Vendor"}
                    </DialogTitle>

                    <DialogDescription>
                      Isi data vendor. Logo bisa dipilih melalui form ini.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!editId && (
                      <>
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">
                            Email
                          </Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vendor@kantinklik.com"
                            required
                            className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">
                            Password
                          </Label>
                          <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="password123"
                            required
                            className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">
                        Nama Pemilik
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Pak Budi"
                        required
                        className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">
                        Nomor WhatsApp
                      </Label>
                      <Input
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="081234567890"
                        required
                        className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">
                        Nomor Kantin
                      </Label>
                      <Input
                        type="number"
                        value={canteenNumber}
                        onChange={(e) =>
                          setCanteenNumber(Number(e.target.value))
                        }
                        placeholder="1"
                        required
                        className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">
                        Nama Kantin
                      </Label>
                      <Input
                        value={canteenName}
                        onChange={(e) => setCanteenName(e.target.value)}
                        placeholder="Kantin Barokah"
                        required
                        className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">
                        Deskripsi
                      </Label>
                      <Input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Menyajikan makanan halal dan lezat"
                        required
                        className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] focus-visible:ring-[#7f1d1d]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-bold text-gray-700">
                        Logo Vendor
                      </Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setLogoFile(e.target.files?.[0] || null)
                        }
                        className="h-11 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] file:mr-4 file:rounded-full file:border-0 file:bg-[#7f1d1d] file:px-4 file:py-1 file:text-sm file:font-bold file:text-white"
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        type="submit"
                        className="rounded-2xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] px-6 font-black text-white shadow-lg shadow-red-900/20 hover:opacity-90"
                      >
                        {editId ? "Simpan Perubahan" : "Tambah Vendor"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* STAT CARDS */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Total Vendor</p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : vendors.length}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">Vendor Aktif</p>
            <h2 className="mt-2 text-4xl font-black text-green-700">
              {loading ? "..." : activeVendors}
            </h2>
          </div>

          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
            <p className="text-sm font-semibold text-gray-500">
              Vendor Nonaktif
            </p>
            <h2 className="mt-2 text-4xl font-black text-[#7f1d1d]">
              {loading ? "..." : inactiveVendors}
            </h2>
          </div>
        </section>

        {/* SEARCH */}
        <section className="mb-5 rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-4 shadow-lg shadow-red-900/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7f1d1d]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, WhatsApp, atau nama kantin..."
              className="h-12 rounded-2xl border-[#7f1d1d]/10 bg-[#fff7f7] pl-11 font-medium focus-visible:ring-[#7f1d1d]"
            />
          </div>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white shadow-xl shadow-red-900/5">
          <div className="border-b border-[#7f1d1d]/10 bg-white p-5">
            <h2 className="text-lg font-black text-gray-950">Daftar Vendor</h2>
            <p className="mt-1 text-sm text-gray-500">
              Total hasil ditampilkan: {filteredVendors.length}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Mengambil data vendor...
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="p-10 text-center text-sm font-semibold text-gray-500">
              Data vendor tidak ditemukan.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#fff7f7] hover:bg-[#fff7f7]">
                    <TableHead className="font-black text-[#7f1d1d]">
                      No
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Logo
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Nama Pemilik
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Email
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      WhatsApp
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      No Kantin
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Nama Kantin
                    </TableHead>
                    <TableHead className="font-black text-[#7f1d1d]">
                      Status
                    </TableHead>
                    <TableHead className="text-center font-black text-[#7f1d1d]">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredVendors.map((vendor, index) => {
                    const isActive = getIsActive(vendor);
                    const logoSrc = getLogo(vendor);

                    return (
                      <TableRow
                        key={vendor.id}
                        className="border-[#7f1d1d]/10 hover:bg-[#fff7f7]"
                      >
                        <TableCell className="font-semibold">
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={getCanteenName(vendor)}
                              className="h-11 w-11 rounded-2xl border border-[#7f1d1d]/10 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-xs font-black text-[#7f1d1d]">
                              K
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="font-black text-gray-950">
                          {getVendorName(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getVendorEmail(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getVendorWhatsapp(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getCanteenNumber(vendor)}
                        </TableCell>

                        <TableCell className="font-medium text-gray-600">
                          {getCanteenName(vendor)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isActive
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : "bg-red-100 text-[#7f1d1d] hover:bg-red-100"
                            }
                          >
                            {isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(vendor)}
                              title="Edit vendor"
                              className="rounded-xl border-[#7f1d1d]/20 text-[#7f1d1d] hover:bg-[#fff7f7] hover:text-[#450a0a]"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleToggleActive(vendor)}
                              title={
                                isActive
                                  ? "Nonaktifkan vendor"
                                  : "Aktifkan vendor"
                              }
                              className={
                                isActive
                                  ? "rounded-xl border border-[#7f1d1d]/20 bg-white text-[#7f1d1d] hover:bg-[#fff7f7]"
                                  : "rounded-xl bg-gradient-to-r from-[#991b1b] to-[#450a0a] text-white hover:opacity-90"
                              }
                            >
                              {isActive ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}