"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  MessageSquare,
  Star,
  Store,
  UserRound,
  Utensils,
} from "lucide-react";

type AnyObj = Record<string, any>;

type Vendor = {
  id?: number | string;
  vendorId?: number | string;
  _id?: number | string;

  canteenNumber?: number | string;
  canteenName?: string;
  vendorName?: string;
  name?: string;

  description?: string;
  logoUrl?: string;
  logo?: string;
  image?: string;

  ownerName?: string;

  user?: AnyObj;
  owner?: AnyObj;
  account?: AnyObj;

  ratings?: AnyObj[];
  reviews?: AnyObj[];
  menuRatings?: AnyObj[];
  ratingMenus?: AnyObj[];
  menus?: AnyObj[];

  [key: string]: any;
};

const RAW_BASE_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL || "https://kantinklik.up.railway.app";

function getApiBaseUrl() {
  const cleanUrl = RAW_BASE_API_URL.replace(/\/$/, "");

  if (cleanUrl.endsWith("/api")) {
    return cleanUrl;
  }

  return `${cleanUrl}/api`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || "";
  }

  return "";
}

function getArrayFromResponse(response: any) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;

  if (Array.isArray(response?.menus)) return response.menus;
  if (Array.isArray(response?.data?.menus)) return response.data.menus;

  if (Array.isArray(response?.ratings)) return response.ratings;
  if (Array.isArray(response?.data?.ratings)) return response.data.ratings;

  if (Array.isArray(response?.reviews)) return response.reviews;
  if (Array.isArray(response?.data?.reviews)) return response.data.reviews;

  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;

  return [];
}

function unwrapResponse(result: any) {
  return result?.data?.vendor || result?.data || result?.vendor || result;
}

function findDeepValue(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== "object") return "";

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = findDeepValue(value, keys);
      if (found) return found;
    }
  }

  return "";
}

function getVendorName(vendor: Vendor | null) {
  if (!vendor) return "-";

  return (
    vendor.canteenName ||
    vendor.vendorName ||
    vendor.name ||
    findDeepValue(vendor, ["canteenName", "vendorName", "name"]) ||
    "-"
  );
}

function getVendorDescription(vendor: Vendor | null) {
  if (!vendor) return "-";

  return (
    vendor.description ||
    vendor.address ||
    findDeepValue(vendor, ["description", "address"]) ||
    "Enak"
  );
}

function getVendorOwnerName(vendor: Vendor | null) {
  if (!vendor) return "-";

  return (
    vendor.ownerName ||
    vendor.user?.name ||
    vendor.owner?.name ||
    vendor.account?.name ||
    vendor.name ||
    vendor.canteenName ||
    findDeepValue(vendor, [
      "ownerName",
      "fullName",
      "username",
      "name",
      "canteenName",
    ]) ||
    "-"
  );
}

function getVendorLogo(vendor: Vendor | null) {
  if (!vendor) return "";

  return (
    vendor.logoUrl ||
    vendor.logo ||
    vendor.image ||
    findDeepValue(vendor, ["logoUrl", "logo", "image"]) ||
    ""
  );
}

function getCanteenNumber(vendor: Vendor | null) {
  if (!vendor) return "-";

  return (
    vendor.canteenNumber ||
    findDeepValue(vendor, ["canteenNumber", "nomorKantin", "number"]) ||
    "-"
  );
}

function getRatingValue(item: AnyObj) {
  return Number(item.stars || item.rating || item.rate || item.score || 0);
}

function getMenuIdFromRating(item: AnyObj) {
  return (
    item.menuId ||
    item.menu_id ||
    item.menu?.id ||
    item.menu?.menuId ||
    item.Menu?.id ||
    item.Menu?.menuId ||
    item.orderItem?.menuId ||
    item.orderItem?.menu_id ||
    item.order_item?.menuId ||
    item.order_item?.menu_id ||
    item.orderItem?.menu?.id ||
    item.orderItem?.menu?.menuId ||
    item.order_item?.menu?.id ||
    item.order_item?.menu?.menuId ||
    ""
  );
}

function getMenuId(menu: AnyObj) {
  return menu.id || menu.menuId || menu.menu_id || menu._id || "";
}

function getMenuNameFromMenu(menu: AnyObj) {
  return (
    menu.name ||
    menu.menuName ||
    menu.menu_name ||
    menu.title ||
    menu.menuNameSnapshot ||
    menu.menu_name_snapshot ||
    ""
  );
}

function getMenuImageFromMenu(menu: AnyObj) {
  return (
    menu.imageUrl ||
    menu.image_url ||
    menu.image ||
    menu.photoUrl ||
    menu.photo_url ||
    menu.photo ||
    menu.menuImageSnapshot ||
    menu.menu_image_snapshot ||
    ""
  );
}

function getMenuName(item: AnyObj) {
  return (
    item.menu?.name ||
    item.menu?.menuName ||
    item.menu?.menu_name ||
    item.menu?.title ||
    item.Menu?.name ||
    item.Menu?.menuName ||
    item.Menu?.menu_name ||
    item.Menu?.title ||
    item.orderItem?.menu?.name ||
    item.orderItem?.menu?.menuName ||
    item.orderItem?.menu?.menu_name ||
    item.orderItem?.menu?.title ||
    item.order_item?.menu?.name ||
    item.order_item?.menu?.menuName ||
    item.order_item?.menu?.menu_name ||
    item.order_item?.menu?.title ||
    item.orderItem?.menuNameSnapshot ||
    item.orderItem?.menu_name_snapshot ||
    item.order_item?.menuNameSnapshot ||
    item.order_item?.menu_name_snapshot ||
    item.menuNameSnapshot ||
    item.menu_name_snapshot ||
    item.menuName ||
    item.menu_name ||
    item.name ||
    "Menu"
  );
}

function getMenuImageDirect(item: AnyObj) {
  return (
    item.menu?.imageUrl ||
    item.menu?.image_url ||
    item.menu?.image ||
    item.menu?.photoUrl ||
    item.menu?.photo_url ||
    item.menu?.photo ||
    item.Menu?.imageUrl ||
    item.Menu?.image_url ||
    item.Menu?.image ||
    item.Menu?.photoUrl ||
    item.Menu?.photo_url ||
    item.Menu?.photo ||
    item.orderItem?.menu?.imageUrl ||
    item.orderItem?.menu?.image_url ||
    item.orderItem?.menu?.image ||
    item.orderItem?.menu?.photoUrl ||
    item.orderItem?.menu?.photo_url ||
    item.orderItem?.menu?.photo ||
    item.order_item?.menu?.imageUrl ||
    item.order_item?.menu?.image_url ||
    item.order_item?.menu?.image ||
    item.order_item?.menu?.photoUrl ||
    item.order_item?.menu?.photo_url ||
    item.order_item?.menu?.photo ||
    item.orderItem?.menuImageSnapshot ||
    item.orderItem?.menu_image_snapshot ||
    item.order_item?.menuImageSnapshot ||
    item.order_item?.menu_image_snapshot ||
    item.menuImageSnapshot ||
    item.menu_image_snapshot ||
    item.imageSnapshot ||
    item.image_snapshot ||
    item.imageUrl ||
    item.image_url ||
    item.image ||
    item.photoUrl ||
    item.photo_url ||
    item.photo ||
    ""
  );
}

function getMenuImage(item: AnyObj, vendorMenus: AnyObj[]) {
  const directImage = getMenuImageDirect(item);

  if (directImage) return directImage;

  const ratingMenuId = String(getMenuIdFromRating(item) || "");
  const ratingMenuName = String(getMenuName(item) || "").toLowerCase().trim();

  const foundById = vendorMenus.find((menu) => {
    return String(getMenuId(menu)) === ratingMenuId;
  });

  if (foundById) {
    return getMenuImageFromMenu(foundById);
  }

  const foundByName = vendorMenus.find((menu) => {
    return String(getMenuNameFromMenu(menu)).toLowerCase().trim() === ratingMenuName;
  });

  if (foundByName) {
    return getMenuImageFromMenu(foundByName);
  }

  return "";
}

function getCustomerName(item: AnyObj) {
  return (
    item.customer?.name ||
    item.user?.name ||
    item.customerName ||
    item.name ||
    "Customer"
  );
}

function getComment(item: AnyObj) {
  return item.comment || item.review || item.description || "";
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function normalizeRatings(vendor: Vendor | null, fetchedRatings: AnyObj[]) {
  const fromVendor =
    vendor?.ratings ||
    vendor?.reviews ||
    vendor?.menuRatings ||
    vendor?.ratingMenus ||
    [];

  const fromMenus =
    vendor?.menus?.flatMap((menu: AnyObj) => {
      const menuRatings = menu.ratings || menu.reviews || menu.menuRatings || [];

      return menuRatings.map((rating: AnyObj) => ({
        ...rating,
        menu: rating.menu || menu,
        menuName: rating.menuName || menu.name,
      }));
    }) || [];

  return [...fetchedRatings, ...fromVendor, ...fromMenus];
}

function StarDisplay({ value }: { value: number }) {
  const rounded = Math.round(value || 0);

  return (
    <div className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-yellow-500 shadow-sm">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rounded ? "fill-yellow-500" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function CustomerVendorDetailPage() {
  const params = useParams();
  const vendorId = String(params?.id || "");

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [ratings, setRatings] = useState<AnyObj[]>([]);
  const [vendorMenus, setVendorMenus] = useState<AnyObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const allRatings = useMemo(() => {
    return normalizeRatings(vendor, ratings);
  }, [vendor, ratings]);

  const averageRating = useMemo(() => {
    const validRatings = allRatings
      .map((item) => getRatingValue(item))
      .filter((value) => value > 0);

    if (validRatings.length === 0) return 0;

    const total = validRatings.reduce((sum, value) => sum + value, 0);
    return total / validRatings.length;
  }, [allRatings]);

  async function fetchJson(url: string) {
    const token =
      getCookie("accessToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      "";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Gagal mengambil data dari ${url}`);
    }

    return response.json();
  }

  async function fetchVendorDetail() {
    try {
      setLoading(true);
      setError("");

      const baseUrl = getApiBaseUrl();

      const vendorResult = await fetchJson(`${baseUrl}/vendors/${vendorId}`);
      const vendorData = unwrapResponse(vendorResult);
      setVendor(vendorData);

      let menusData: AnyObj[] = [];

      try {
        const menuResult = await fetchJson(`${baseUrl}/vendors/${vendorId}/menus`);
        menusData = getArrayFromResponse(menuResult);
        setVendorMenus(menusData);

        console.log("VENDOR MENUS RESPONSE:", menuResult);
        console.log("VENDOR MENUS ARRAY:", menusData);
      } catch (menuError) {
        console.log("GET VENDOR MENUS ERROR:", menuError);
        setVendorMenus([]);
      }

      try {
        const ratingResult = await fetchJson(
          `${baseUrl}/ratings/vendor/${vendorId}`
        );

        const ratingData = getArrayFromResponse(ratingResult);
        setRatings(ratingData);

        console.log("VENDOR DETAIL DATA:", vendorData);
        console.log("VENDOR RATING RESPONSE:", ratingResult);
        console.log("VENDOR RATING ARRAY:", ratingData);
      } catch (ratingError) {
        console.log("GET VENDOR RATINGS ERROR:", ratingError);
        setRatings([]);
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mengambil detail vendor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (vendorId) {
      fetchVendorDetail();
    }
  }, [vendorId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fff7f7] px-4 py-8 md:px-10">
        <div className="flex min-h-[70vh] items-center justify-center rounded-[2rem] bg-white shadow-sm">
          <div className="flex items-center gap-3 text-[#7f1d1d]">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="font-bold">Memuat detail vendor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !vendor) {
    return (
      <main className="min-h-screen bg-[#fff7f7] px-4 py-8 md:px-10">
        <div className="rounded-[2rem] border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-black text-[#7f1d1d]">
            Data vendor tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Silakan coba lagi nanti."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7f7] px-4 py-6 md:px-8 lg:px-10">
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#8b1117] p-6 text-white shadow-lg shadow-red-900/10 md:p-8">
          <div className="max-w-[70%]">
            <h1 className="text-3xl font-black md:text-5xl">
              {getVendorName(vendor)}
            </h1>

            <p className="mt-3 text-sm font-semibold text-red-100 md:text-base">
              {getVendorDescription(vendor)}
            </p>
          </div>

          <div className="absolute right-6 top-0 rounded-b-3xl bg-white/15 px-8 py-4 text-center backdrop-blur md:right-10">
            <div className="flex items-center justify-center gap-2 text-3xl font-black">
              <Star className="h-7 w-7 fill-yellow-400 text-yellow-400" />
              {averageRating ? averageRating.toFixed(1) : "0.0"}
            </div>

            <p className="mt-1 text-xs font-bold text-red-100">
              {allRatings.length} rating menu
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[400px_1fr]">
          <aside className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-red-900/10">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-[2rem] bg-[#fff1f1] text-[#7f1d1d]">
                {getVendorLogo(vendor) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getVendorLogo(vendor)}
                    alt={getVendorName(vendor)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store className="h-16 w-16" />
                )}
              </div>

              <h2 className="mt-6 text-2xl font-black text-gray-950">
                {getVendorName(vendor)}
              </h2>

              <p className="mt-2 text-sm font-semibold text-gray-500">
                {getVendorDescription(vendor)}
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-red-900/10 bg-[#fffafa] p-4">
                <div className="flex items-center gap-3 text-[#9b1c1c]">
                  <UserRound className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                    Nama
                  </p>
                </div>

                <p className="mt-3 break-words text-sm font-bold text-gray-900">
                  {getVendorOwnerName(vendor)}
                </p>
              </div>

              <div className="rounded-2xl border border-red-900/10 bg-[#fffafa] p-4">
                <div className="flex items-center gap-3 text-[#9b1c1c]">
                  <Store className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-wide text-gray-400">
                    Nomor Kantin
                  </p>
                </div>

                <p className="mt-3 break-words text-sm font-bold text-gray-900">
                  {getCanteenNumber(vendor)}
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-red-900/10 md:p-8">
            <h2 className="text-2xl font-black text-gray-950">
              Menu yang Pernah Dirating
            </h2>

            <p className="mt-2 text-sm font-semibold text-gray-500">
              Rating vendor dihitung dari rata-rata rating menu-menu vendor ini.
            </p>

            {allRatings.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-red-900/10 bg-[#fffafa] p-6 text-center">
                <p className="font-bold text-gray-700">
                  Belum ada menu yang dirating.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                {allRatings.map((item, index) => {
                  const menuName = getMenuName(item);
                  const menuImage = getMenuImage(item, vendorMenus);

                  console.log("CEK RATING ITEM:", item);
                  console.log("CEK MENU NAME:", menuName);
                  console.log("CEK MENU IMAGE:", menuImage);

                  return (
                    <article
                      key={item.id || item.ratingId || index}
                      className="rounded-2xl border border-red-900/10 bg-[#fffafa] p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white text-[#9b1c1c]">
                            {menuImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={menuImage}
                                alt={menuName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Utensils className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-gray-950">
                              {menuName}
                            </h3>

                            <p className="mt-1 text-sm font-semibold text-gray-500">
                              oleh {getCustomerName(item)}
                            </p>

                            <p className="mt-1 text-xs font-bold text-gray-400">
                              {formatDate(item.createdAt || item.created_at)}
                            </p>
                          </div>
                        </div>

                        <StarDisplay value={getRatingValue(item)} />
                      </div>

                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-[#9b1c1c]">
                          <MessageSquare className="h-4 w-4" />
                          <p className="text-xs font-black uppercase">
                            Komentar
                          </p>
                        </div>

                        <p className="text-sm font-semibold text-gray-800">
                          {getComment(item) || "Tidak ada komentar."}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}