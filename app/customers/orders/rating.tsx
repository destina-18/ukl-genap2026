"use client";

import { FormEvent, useState } from "react";
import { Loader2, Star, X } from "lucide-react";

type RatingProps = {
  orderItemId: number | string;
  baseApiUrl: string;
  onSuccess: () => void;
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

function saveRatingToLocal(orderItemId: number | string, stars: number) {
  if (typeof window === "undefined") return;

  localStorage.setItem(`rating-order-item-${orderItemId}`, String(stars));

  window.dispatchEvent(
    new CustomEvent("rating-updated", {
      detail: {
        orderItemId: String(orderItemId),
        stars,
      },
    })
  );
}

function getErrorMessage(data: any) {
  if (Array.isArray(data?.message)) return data.message.join(", ");
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.error === "string") return data.error;

  return "Gagal memberi rating";
}

function isAlreadyRatedMessage(message: string) {
  const lower = message.toLowerCase();

  return (
    lower.includes("sudah memberikan rating") ||
    lower.includes("sudah memberi rating") ||
    lower.includes("sudah dirating") ||
    lower.includes("already rated") ||
    lower.includes("already")
  );
}

export default function Rating({
  orderItemId,
  baseApiUrl,
  onSuccess,
}: RatingProps) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState<number>(5);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!Number.isInteger(stars)) {
      alert("Rating harus angka bulat");
      return;
    }

    if (stars < 1 || stars > 5) {
      alert("Rating harus 1 sampai 5");
      return;
    }

    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        alert("Kamu belum login");
        window.location.href = "/sign-in";
        return;
      }

      const payload = {
        orderItemId: Number(orderItemId),
        stars: Number(stars),
      };

      console.log("RATING PAYLOAD:", payload);

      const cleanBaseApiUrl = baseApiUrl.replace(/\/$/, "");
      const ratingUrl = cleanBaseApiUrl.endsWith("/api")
        ? `${cleanBaseApiUrl}/ratings`
        : `${cleanBaseApiUrl}/api/ratings`;

      const response = await fetch(ratingUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      console.log("RATING STATUS:", response.status);
      console.log("RATING RESPONSE:", data);

      if (!response.ok) {
        const message = getErrorMessage(data);

        if (isAlreadyRatedMessage(message)) {
          saveRatingToLocal(orderItemId, stars);
          alert("Kamu sudah memberikan rating untuk item ini.");
          setOpen(false);
          onSuccess();
          return;
        }

        alert(message);
        return;
      }

      saveRatingToLocal(orderItemId, stars);

      alert("Rating berhasil dikirim");
      setOpen(false);
      setStars(5);
      onSuccess();
    } catch (error) {
      console.error("RATING ERROR:", error);
      alert("Gagal terhubung ke server saat memberi rating");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-50 px-4 py-2 text-xs font-black text-yellow-700 transition hover:bg-yellow-100"
      >
        <Star className="h-4 w-4 fill-current" />
        Beri Rating
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-950">
                  Beri Rating
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Kasih penilaian untuk menu yang sudah kamu pesan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-3 block text-sm font-black text-gray-700">
                  Rating
                </label>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStars(value)}
                      disabled={loading}
                      className="transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Star
                        className={`h-9 w-9 ${
                          value <= stars
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <p className="mt-2 text-sm font-bold text-gray-500">
                  {stars} dari 5
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-[#7f1d1d]/20 bg-white px-5 py-3 text-sm font-black text-[#7f1d1d] transition hover:bg-[#fff7f7] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7f1d1d] px-5 py-3 text-sm font-black text-white transition hover:bg-[#991b1b] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Mengirim..." : "Kirim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}