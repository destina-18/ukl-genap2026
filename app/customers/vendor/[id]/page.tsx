"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  Star,
  Store,
  User,
  Utensils,
} from "lucide-react";

type VendorData = {
  id?: number | string;
  canteenName?: string;
  name?: string;
  description?: string;
  logoUrl?: string | null;
  canteenNumber?: number | string;
  isActive?: boolean;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    whatsappNumber?: string;
  };
};

type RatingItem = {
  id?: number | string;
  rating?: number;
  stars?: number;
  comment?: string;
  createdAt?: string;
  created_at?: string;

  customer?: {
    id?: number | string;
    name?: string;
    email?: string;
  };

  user?: {
    id?: number | string;
    name?: string;
    email?: string;
  };

  targetMenu?: {
    id?: number | string;
    name?: string;
    price?: number | string;
    imageUrl?: string | null;
  };

  menu?: {
    id?: number | string;
    name?: string;
    price?: number | string;
    imageUrl?: string | null;
  };

  orderItem?: {
    id?: number | string;
    menu?: {
      id?: number | string;
      name?: string;
      price?: number | string;
      imageUrl?: string | null;
    };
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

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    getCookie("accessToken") ||
    getCookie("accesstoken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

function getArrayFromResponse(data: any) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;

  if (Array.isArray(data?.ratings)) return data.ratings;
  if (Array.isArray(data?.data?.ratings)) return data.data.ratings;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data?.items)) return data.data.items;

  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.data?.result)) return data.data.result;

  return [];
}

function getObjectFromResponse(data: any) {
  return data?.data || data?.vendor || data?.profile || data;
}

function getRatingValue(item: RatingItem) {
  return Number(item.rating || item.stars || 0);
}

function getCustomerName(item: RatingItem) {
  return item.customer?.name || item.user?.name || "Customer";
}

function getMenuName(item: RatingItem) {
  return (
    item.targetMenu?.name ||
    item.menu?.name ||
    item.orderItem?.menu?.name ||
    "Menu"
  );
}

function getMenuImage(item: RatingItem) {
  return (
    item.targetMenu?.imageUrl ||
    item.menu?.imageUrl ||
    item.orderItem?.menu?.imageUrl ||
    null
  );
}

function formatDate(date?: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function averageRating(ratings: RatingItem[]) {
  if (ratings.length === 0) return 0;

  const total = ratings.reduce((sum, item) => {
    return sum + getRatingValue(item);
  }, 0);

  return total / ratings.length;
}

export default function CustomerVendorDetailPage() {
  const params = useParams();
  const vendorId = String(params.id);

  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchVendorProfile() {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Token tidak ditemukan. Silakan login ulang.");
        window.location.href = "/sign-in";
        return;
      }

      /*
        1. Ambil detail vendor.
        Kalau endpoint ini tidak ada di BE kamu, bagian ini boleh gagal,
        rating tetap jalan.
      */
      const vendorRes = await fetch(`${BASE_API_URL}/api/vendors/${vendorId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const vendorData = await vendorRes.json().catch(() => null);
      console.log("CUSTOMER VENDOR DETAIL RESPONSE:", vendorData);

      if (vendorRes.ok) {
        setVendor(getObjectFromResponse(vendorData));
      }

      /*
        2. Ambil semua rating milik vendor.
        Ini sesuai Swagger kamu:
        GET /api/ratings/vendor/:vendorId?page=1&limit=100
      */
      const ratingRes = await fetch(
        `${BASE_API_URL}/api/ratings/vendor/${vendorId}?page=1&limit=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const ratingData = await ratingRes.json().catch(() => null);
      console.log("CUSTOMER VENDOR RATINGS RESPONSE:", ratingData);

      if (!ratingRes.ok) {
        setRatings([]);
        return;
      }

      setRatings(getArrayFromResponse(ratingData));
    } catch (error) {
      console.error("ERROR FETCH CUSTOMER VENDOR PROFILE:", error);
      alert("Gagal mengambil profile vendor");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendorProfile();
  }, [vendorId]);

  const avg = averageRating(ratings);

  return (
    <main className="min-h-screen bg-[#fff7f7] p-4 text-gray-900 md:p-8">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20">
          <Link
            href="/customers/menu"
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black text-red-50 backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={16} />
            Kembali ke Menu
          </Link>

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur">
                <Store className="h-4 w-4" />
                Profile Vendor
              </div>

              <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                {vendor?.canteenName || vendor?.name || "Detail Vendor"}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-red-100">
                {vendor?.description ||
                  "Lihat informasi vendor dan rating menu dari customer."}
              </p>
            </div>

            <div className="rounded-2xl bg-white/15 px-6 py-5 text-center backdrop-blur">
              <p className="text-sm font-bold text-red-100">Rating Vendor</p>

              <div className="mt-2 flex items-center justify-center gap-2">
                <Star className="h-7 w-7 fill-yellow-300 text-yellow-300" />

                <span className="text-4xl font-black">
                  {avg > 0 ? avg.toFixed(1) : "-"}
                </span>
              </div>

              <p className="mt-1 text-xs font-bold text-red-100">
                {ratings.length} rating menu
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-10 text-center text-sm font-semibold text-gray-500 shadow-xl shadow-red-900/5">
            Mengambil data vendor...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-xl shadow-red-900/5">
              <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2rem] bg-[#fff7f7] text-[#7f1d1d]">
                {vendor?.logoUrl ? (
                  <img
                    src={vendor.logoUrl}
                    alt="Logo Vendor"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={56} />
                )}
              </div>

              <h2 className="mt-6 text-center text-2xl font-black text-gray-950">
                {vendor?.canteenName || vendor?.name || "-"}
              </h2>

              <p className="mt-2 text-center text-sm font-semibold leading-6 text-gray-500">
                {vendor?.description || "Tidak ada deskripsi vendor."}
              </p>

              <div className="mt-6 space-y-3">
                <InfoRow
                  icon={<User size={18} />}
                  label="Pemilik"
                  value={vendor?.user?.name || "-"}
                />

                <InfoRow
                  icon={<Mail size={18} />}
                  label="Email"
                  value={vendor?.user?.email || "-"}
                />

                <InfoRow
                  icon={<Phone size={18} />}
                  label="WhatsApp"
                  value={vendor?.user?.whatsappNumber || "-"}
                />

                <InfoRow
                  icon={<Store size={18} />}
                  label="Nomor Kantin"
                  value={
                    vendor?.canteenNumber ? String(vendor.canteenNumber) : "-"
                  }
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-xl shadow-red-900/5 lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-950">
                  Menu yang Pernah Dirating
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Rating vendor dihitung dari rata-rata rating menu-menu vendor
                  ini.
                </p>
              </div>

              {ratings.length === 0 ? (
                <div className="rounded-2xl bg-[#fff7f7] p-8 text-center">
                  <Star className="mx-auto h-10 w-10 text-[#7f1d1d]" />

                  <h3 className="mt-4 text-lg font-black text-gray-950">
                    Belum ada rating
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    Vendor ini belum punya menu yang dirating customer.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.map((item, index) => {
                    const starValue = getRatingValue(item);
                    const image = getMenuImage(item);

                    return (
                      <div
                        key={String(item.id || index)}
                        className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-[#7f1d1d]">
                              {image ? (
                                <img
                                  src={image}
                                  alt={getMenuName(item)}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Utensils size={30} />
                              )}
                            </div>

                            <div>
                              <h3 className="text-lg font-black text-gray-950">
                                {getMenuName(item)}
                              </h3>

                              <p className="mt-1 flex items-center gap-2 text-sm font-bold text-gray-500">
                                <User size={15} />
                                {getCustomerName(item)}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-gray-400">
                                {formatDate(item.createdAt || item.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 rounded-full bg-white px-4 py-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= starValue
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl bg-white p-4">
                          <div className="mb-2 flex items-center gap-2 text-[#7f1d1d]">
                            <MessageSquare size={16} />
                            <p className="text-xs font-black uppercase tracking-wide">
                              Komentar
                            </p>
                          </div>

                          <p className="text-sm font-semibold leading-6 text-gray-700">
                            {item.comment || "Tidak ada komentar."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-4">
      <div className="mb-2 flex items-center gap-2 text-[#7f1d1d]">
        {icon}
        <p className="text-xs font-black uppercase tracking-wide text-gray-400">
          {label}
        </p>
      </div>

      <p className="break-words text-sm font-black text-gray-900">{value}</p>
    </div>
  );
}