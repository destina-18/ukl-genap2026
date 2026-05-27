"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Search,
  Power,
  PowerOff,
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

  return (
    <main className="w-full p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Vendor</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun vendor kantin.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Vendor
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Vendor" : "Tambah Vendor"}
              </DialogTitle>
              <DialogDescription>
                Isi data vendor. Logo bisa dipilih di form ini.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editId && (
                <>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vendor@kantinklik.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="password123"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Nama Pemilik</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Pak Budi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nomor WhatsApp</Label>
                <Input
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="081234567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nomor Kantin</Label>
                <Input
                  type="number"
                  value={canteenNumber}
                  onChange={(e) => setCanteenNumber(Number(e.target.value))}
                  placeholder="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Nama Kantin</Label>
                <Input
                  value={canteenName}
                  onChange={(e) => setCanteenName(e.target.value)}
                  placeholder="Kantin Barokah"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Menyajikan makanan halal dan lezat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Logo Vendor</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editId ? "Simpan Perubahan" : "Tambah Vendor"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-5 rounded-xl border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, WhatsApp, atau nama kantin..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Daftar Vendor</h2>
          <p className="text-sm text-muted-foreground">
            Total vendor: {vendors.length}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Mengambil data vendor...
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Data vendor tidak ditemukan.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nama Pemilik</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>No Kantin</TableHead>
                  <TableHead>Nama Kantin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredVendors.map((vendor, index) => {
                  const isActive = getIsActive(vendor);
                  const logoSrc = getLogo(vendor);

                  return (
                    <TableRow key={vendor.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell>
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={getCanteenName(vendor)}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs">
                            -
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="font-medium">
                        {getVendorName(vendor)}
                      </TableCell>

                      <TableCell>{getVendorEmail(vendor)}</TableCell>

                      <TableCell>{getVendorWhatsapp(vendor)}</TableCell>

                      <TableCell>{getCanteenNumber(vendor)}</TableCell>

                      <TableCell>{getCanteenName(vendor)}</TableCell>

                      <TableCell>
                        <Badge variant={isActive ? "default" : "destructive"}>
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
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant={isActive ? "outline" : "default"}
                            onClick={() => handleToggleActive(vendor)}
                            title={
                              isActive
                                ? "Nonaktifkan vendor"
                                : "Aktifkan vendor"
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
      </div>
    </main>
  );
}