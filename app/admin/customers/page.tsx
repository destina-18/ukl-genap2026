"use client";

import { useEffect, useState } from "react";
import { Search, ShieldCheck, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  is_verified?: boolean;
  verified?: boolean;
  created_at?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

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

  async function fetchCustomers() {
    try {
      setLoading(true);

      const token = getCookie("accessToken");

      const res = await fetch(`${BASE_API_URL}/api/admin/customers`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengambil data customer");
        return;
      }

      setCustomers(data.data || data || []);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengambil data customer");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id: number) {
    const confirmVerify = confirm("Yakin ingin toggle verifikasi customer ini?");

    if (!confirmVerify) return;

    try {
      const token = getCookie("accessToken");

      const res = await fetch(
        `${BASE_API_URL}/api/admin/customers/${id}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal mengubah verifikasi customer");
        return;
      }

      alert("Verifikasi customer berhasil diubah");
      fetchCustomers();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat verifikasi customer");
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(keyword) ||
      customer.email?.toLowerCase().includes(keyword) ||
      customer.phone?.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="w-full p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Data Customer</h1>
        <p className="text-sm text-muted-foreground">
          Kelola data dan verifikasi customer kantin.
        </p>
      </div>

      <div className="mb-5 rounded-xl border bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau no HP..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <h2 className="font-semibold">Daftar Customer</h2>
          <p className="text-sm text-muted-foreground">
            Total customer: {customers.length}
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Mengambil data customer...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Data customer tidak ditemukan.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>No HP</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Verifikasi</TableHead>
                  <TableHead>Tanggal Daftar</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCustomers.map((customer, index) => {
                  const isVerified =
                    customer.is_verified === true || customer.verified === true;

                  return (
                    <TableRow key={customer.id}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell className="font-medium">
                        {customer.name || "-"}
                      </TableCell>

                      <TableCell>{customer.email || "-"}</TableCell>

                      <TableCell>{customer.phone || "-"}</TableCell>

                      <TableCell>{customer.address || "-"}</TableCell>

                      <TableCell>
                        <Badge variant={isVerified ? "default" : "destructive"}>
                          {isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {customer.created_at
                          ? new Date(customer.created_at).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.location.href = `/admin/customers/${customer.id}`
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleVerify(customer.id)}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Verify
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