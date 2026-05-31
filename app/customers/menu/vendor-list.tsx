"use client";

import Link from "next/link";
import { Store, UserRound } from "lucide-react";

export type Vendor = {
  id?: number | string;
  vendorId?: number | string;
  _id?: number | string;
  canteenNumber?: number | string;
  canteenName?: string;
  name?: string;
  vendorName?: string;
  email?: string;
  logoUrl?: string;
  logo?: string;
  image?: string;
  description?: string;
  address?: string;
  isActive?: boolean;
  _count?: {
    menus?: number;
  };
  [key: string]: any;
};

type VendorListProps = {
  vendors: Vendor[];
  selectedVendorId: string;
  loadingVendors: boolean;
  onSelectVendor: (vendorId: string) => void;
};

export function getVendorId(vendor: Vendor) {
  return vendor.id || vendor.vendorId || vendor._id;
}

export function getVendorName(vendor: Vendor) {
  return vendor.canteenName || vendor.name || vendor.vendorName || "Vendor";
}

export function getVendorDescription(vendor: Vendor) {
  return (
    vendor.description ||
    vendor.address ||
    vendor.email ||
    `Kantin nomor ${vendor.canteenNumber || "-"}`
  );
}

export function getVendorLogo(vendor: Vendor) {
  return vendor.logoUrl || vendor.logo || vendor.image || "";
}

export default function VendorList({
  vendors,
  selectedVendorId,
  loadingVendors,
  onSelectVendor,
}: VendorListProps) {
  return (
    <aside className="rounded-[1.5rem] border border-[#7f1d1d]/10 bg-white p-5 shadow-lg shadow-red-900/5">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7f1d1d]/10 text-[#7f1d1d]">
          <Store className="h-6 w-6" />
        </div>

        <div>
          <h2 className="text-lg font-black text-gray-950">Pilih Vendor</h2>
          <p className="text-sm text-gray-500">Total vendor: {vendors.length}</p>
        </div>
      </div>

      {loadingVendors ? (
        <div className="rounded-2xl bg-[#fff7f7] p-4 text-sm font-bold text-[#7f1d1d]">
          Memuat vendor...
        </div>
      ) : vendors.length === 0 ? (
        <div className="rounded-2xl bg-[#fff7f7] p-4 text-sm text-gray-500">
          Belum ada vendor aktif.
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor) => {
            const vendorId = getVendorId(vendor);
            const vendorLogo = getVendorLogo(vendor);
            const isActive = String(vendorId) === String(selectedVendorId);

            if (!vendorId) return null;

            return (
              <div
                key={String(vendorId)}
                className={`rounded-2xl border p-4 transition ${
                  isActive
                    ? "border-[#7f1d1d] bg-[#7f1d1d] text-white shadow-lg shadow-red-900/20"
                    : "border-[#7f1d1d]/10 bg-white text-gray-700 hover:bg-[#fff7f7]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectVendor(String(vendorId))}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-[#7f1d1d]/10 text-[#7f1d1d]"
                      }`}
                    >
                      {vendorLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={vendorLogo}
                          alt={getVendorName(vendor)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {getVendorName(vendor)}
                      </p>

                      <p
                        className={`mt-1 truncate text-xs ${
                          isActive ? "text-red-100" : "text-gray-500"
                        }`}
                      >
                        {getVendorDescription(vendor)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-bold ${
                          isActive ? "text-red-100" : "text-[#7f1d1d]"
                        }`}
                      >
                        {vendor._count?.menus || 0} menu
                      </p>
                    </div>
                  </div>
                </button>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <Link
                    href={`/customers/vendor/${vendorId}`}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition ${
                      isActive
                        ? "bg-white text-[#7f1d1d] hover:bg-red-50"
                        : "bg-[#7f1d1d] text-white hover:bg-[#991b1b]"
                    }`}
                  >
                    <UserRound className="h-4 w-4" />
                    Lihat Profile & Rating
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}