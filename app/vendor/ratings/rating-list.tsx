"use client";

import { Loader2, Star } from "lucide-react";
import RatingCard, { type RatingItem } from "./rating-card";

type RatingListProps = {
  ratings: RatingItem[];
  loading: boolean;
};

export default function RatingList({ ratings, loading }: RatingListProps) {
  return (
    <section className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-6 shadow-lg shadow-red-900/5">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-gray-950">Daftar Rating</h2>

        <p className="mt-1 text-sm text-gray-500">
          Rating dari customer untuk menu vendor ini.
        </p>
      </div>

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#7f1d1d]" />
            <p className="text-sm font-black text-[#7f1d1d]">
              Memuat daftar rating...
            </p>
          </div>
        </div>
      ) : ratings.length === 0 ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-dashed border-[#7f1d1d]/20 bg-[#fff7f7] p-8 text-center">
          <div>
            <Star className="mx-auto mb-4 h-14 w-14 text-[#7f1d1d]" />

            <h3 className="text-xl font-black text-gray-950">
              Belum ada rating
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Rating akan muncul setelah customer memberi penilaian pada pesanan
              yang sudah selesai.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {ratings.map((item, index) => (
            <RatingCard key={String(item.id || index)} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}