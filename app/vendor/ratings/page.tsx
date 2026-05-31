"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";

import RatingList from "./rating-list";
import RatingSummary from "./rating-summary";
import type { RatingItem } from "./rating-card";
import { getRatingStars } from "./rating-card";

type VendorProfile = {
  id?: number | string;
  vendorId?: number | string;
  vendor_id?: number | string;
  name?: string;
  canteenName?: string;
  canteen_name?: string;
  vendor?: {
    id?: number | string;
    name?: string;
    canteenName?: string;
    canteen_name?: string;
    vendorId?: number | string;
    vendor_id?: number | string;
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
    getCookie("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getProfileFromResponse(response: any): VendorProfile {
  return (
    response?.data?.vendor ||
    response?.data?.user?.vendor ||
    response?.data?.profile?.vendor ||
    response?.data?.profile ||
    response?.data?.user ||
    response?.data ||
    response?.vendor ||
    response?.user?.vendor ||
    response?.user ||
    response?.profile ||
    response ||
    {}
  );
}

function getArrayFromResponse(response: any): RatingItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.ratings)) return response.ratings;
  if (Array.isArray(response?.data?.ratings)) return response.data.ratings;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.result)) return response.data.result;

  return [];
}

function getVendorId(profile: VendorProfile | null) {
  if (!profile) return "";

  return (
    profile.vendor?.id ||
    profile.vendorId ||
    profile.vendor_id ||
    profile.id ||
    ""
  );
}

function getAverageFromResponse(response: any, ratings: RatingItem[]) {
  const avgFromBackend =
    response?.averageRating ||
    response?.avgRating ||
    response?.computedAvgRating ||
    response?.computedAverageRating ||
    response?.data?.averageRating ||
    response?.data?.avgRating ||
    response?.data?.computedAvgRating ||
    response?.data?.computedAverageRating ||
    0;

  const avgNumber = Number(avgFromBackend || 0);

  if (avgNumber > 0) return avgNumber;

  const totalStars = ratings.reduce((sum, item) => {
    return sum + getRatingStars(item);
  }, 0);

  return ratings.length ? totalStars / ratings.length : 0;
}

export default function VendorRatingsPage() {
  const BASE_API_URL =
    process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function getVendorProfile() {
    try {
      setLoadingProfile(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const endpoints = [
        `${BASE_API_URL}/api/vendor/profile`,
        `${BASE_API_URL}/api/vendors/me`,
        `${BASE_API_URL}/api/users/me`,
      ];

      let profileData: VendorProfile | null = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          });

          const data = await response.json().catch(() => null);

          console.log("VENDOR PROFILE ENDPOINT:", endpoint);
          console.log("VENDOR PROFILE STATUS:", response.status);
          console.log("VENDOR PROFILE RESPONSE:", data);

          if (response.ok) {
            profileData = getProfileFromResponse(data);
            break;
          }
        } catch (error) {
          console.error("PROFILE ENDPOINT ERROR:", endpoint, error);
        }
      }

      if (!profileData) {
        setErrorMessage("Profile vendor gagal diambil.");
        return;
      }

      setProfile(profileData);

      const vendorId = getVendorId(profileData);

      console.log("VENDOR ID YANG DIPAKAI:", vendorId);

      if (!vendorId) {
        setErrorMessage(
          "Vendor ID tidak ditemukan dari profile. Cek response /api/vendor/profile."
        );
        return;
      }

      await getVendorRatings(vendorId);
    } catch (error) {
      console.error("GET VENDOR PROFILE ERROR:", error);
      setErrorMessage("Gagal terhubung ke server saat mengambil profile vendor.");
    } finally {
      setLoadingProfile(false);
    }
  }

  async function getVendorRatings(vendorId: number | string) {
    try {
      setLoadingRatings(true);
      setErrorMessage("");

      const token = getToken();

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const endpoint = `${BASE_API_URL}/api/ratings/vendor/${vendorId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await response.json().catch(() => null);

      console.log("RATINGS ENDPOINT:", endpoint);
      console.log("RATINGS STATUS:", response.status);
      console.log("RATINGS RESPONSE:", data);

      if (!response.ok) {
        setRatings([]);
        setAverageRating(0);
        setErrorMessage(
          data?.message ||
            "Rating gagal diambil dari endpoint /api/ratings/vendor/{vendorId}."
        );
        return;
      }

      const ratingData = getArrayFromResponse(data);

      setRatings(ratingData);
      setAverageRating(getAverageFromResponse(data, ratingData));
    } catch (error) {
      console.error("GET VENDOR RATINGS ERROR:", error);
      setRatings([]);
      setAverageRating(0);
      setErrorMessage("Gagal terhubung ke server saat mengambil rating.");
    } finally {
      setLoadingRatings(false);
    }
  }

  function handleRefresh() {
    const vendorId = getVendorId(profile);

    if (!vendorId) {
      getVendorProfile();
      return;
    }

    getVendorRatings(vendorId);
  }

  useEffect(() => {
    getVendorProfile();
  }, []);

  const loading = loadingProfile || loadingRatings;

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-8 text-gray-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#450a0a] p-7 text-white shadow-2xl shadow-red-900/20 md:p-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <Link
                href="/vendor/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-red-50 backdrop-blur transition hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
              </Link>

              <h1 className="text-3xl font-black tracking-tight md:text-5xl">
                Rating Vendor
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-red-100 md:text-base">
                Lihat rating yang diberikan customer untuk menu dari kantinmu.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </section>

        {loadingProfile ? (
          <section className="flex min-h-[350px] items-center justify-center rounded-[1.5rem] bg-white shadow-lg shadow-red-900/5">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#7f1d1d]" />
              <p className="text-sm font-black text-[#7f1d1d]">
                Memuat rating vendor...
              </p>
            </div>
          </section>
        ) : errorMessage ? (
          <section className="rounded-[1.5rem] border border-red-200 bg-white p-8 text-center shadow-lg shadow-red-900/5">
            <h2 className="text-xl font-black text-red-700">Gagal memuat</h2>

            <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-5 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#991b1b]"
            >
              Coba Lagi
            </button>
          </section>
        ) : (
          <>
            <RatingSummary
              profile={profile}
              ratings={ratings}
              averageRating={averageRating}
            />

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
              <div className="hidden lg:block" />

              <RatingList ratings={ratings} loading={loadingRatings} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}