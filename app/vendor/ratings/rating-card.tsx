"use client";

import { Star } from "lucide-react";

export type RatingItem = {
  id?: number | string;
  stars?: number;
  rating?: number;
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

  menu?: {
    id?: number | string;
    name?: string;
  };

  orderItem?: {
    id?: number | string;
    menu?: {
      id?: number | string;
      name?: string;
    };
  };

  [key: string]: any;
};

type RatingCardProps = {
  item: RatingItem;
};

export function getRatingStars(item: RatingItem) {
  return Number(item.stars || item.rating || 0);
}

export function getCustomerName(item: RatingItem) {
  return (
    item.customer?.name ||
    item.user?.name ||
    item.customerName ||
    item.customer_name ||
    "Customer"
  );
}

export function getMenuName(item: RatingItem) {
  return (
    item.menu?.name ||
    item.orderItem?.menu?.name ||
    item.menuName ||
    item.menu_name ||
    "Menu"
  );
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function RatingCard({ item }: RatingCardProps) {
  const stars = getRatingStars(item);

  return (
    <article className="rounded-2xl border border-[#7f1d1d]/10 bg-[#fff7f7] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= stars
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>

            <span className="text-sm font-black text-gray-700">
              {stars}/5
            </span>
          </div>

          <h3 className="font-black text-gray-950">{getMenuName(item)}</h3>

          <p className="mt-1 text-sm text-gray-500">
            Dari: {getCustomerName(item)}
          </p>

          {item.comment && (
            <p className="mt-3 rounded-2xl bg-white p-4 text-sm leading-6 text-gray-600">
              {item.comment}
            </p>
          )}
        </div>

        <p className="text-sm font-bold text-gray-400">
          {formatDate(item.createdAt || item.created_at)}
        </p>
      </div>
    </article>
  );
}