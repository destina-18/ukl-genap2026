"use client";

import { MessageSquareText, Star, Store } from "lucide-react";
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
  };
  [key: string]: any;
};

type RatingSummaryProps = {
  profile: VendorProfile | null;
  ratings: RatingItem[];
  averageRating: number;
};

function getVendorName(profile: VendorProfile | null) {
  if (!profile) return "Vendor";

  return (
    profile.vendor?.canteenName ||
    profile.vendor?.canteen_name ||
    profile.vendor?.name ||
    profile.canteenName ||
    profile.canteen_name ||
    profile.name ||
    "Vendor"
  );
}

export default function RatingSummary({
  profile,
  ratings,
  averageRating,
}: RatingSummaryProps) {
  const totalRatings = ratings.length;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const total = ratings.filter((item) => getRatingStars(item) === star)
      .length;

    return {
      star,
      total,
      percentage: totalRatings ? Math.round((total / totalRatings) * 100) : 0,
    };
  });

  return (
    <>
      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
            <Store className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-gray-500">Vendor</p>

          <h2 className="mt-2 line-clamp-2 text-2xl font-black text-gray-950">
            {getVendorName(profile)}
          </h2>
        </div>

        <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-700">
            <Star className="h-6 w-6 fill-current" />
          </div>

          <p className="text-sm font-semibold text-gray-500">
            Rata-rata Rating
          </p>

          <h2 className="mt-2 text-4xl font-black text-yellow-700">
            {averageRating.toFixed(1)}
          </h2>
        </div>

        <div className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <MessageSquareText className="h-6 w-6" />
          </div>

          <p className="text-sm font-semibold text-gray-500">Total Rating</p>

          <h2 className="mt-2 text-4xl font-black text-blue-700">
            {totalRatings}
          </h2>
        </div>
      </section>

      <aside className="h-fit rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
        <h2 className="mb-5 text-xl font-black text-gray-950">
          Ringkasan Bintang
        </h2>

        <div className="space-y-4">
          {ratingCounts.map((item) => (
            <div key={item.star}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 font-black text-gray-700">
                  {item.star}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </span>

                <span className="font-bold text-gray-500">
                  {item.total} rating
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[#7f1d1d]"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}