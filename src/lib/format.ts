import { getStoreDayBounds, formatStoreTime } from "@/lib/store-time";
import type { DiscountType } from "@/generated/prisma/client";

export function formatRelativeIndonesian(date: Date, now: Date = new Date()): string {
  const { start: todayStart } = getStoreDayBounds(now);
  if (date.getTime() >= todayStart.getTime()) {
    return `Hari ini, ${formatStoreTime(date)}`;
  }

  const diffDays = Math.floor((todayStart.getTime() - date.getTime()) / 86_400_000);
  if (diffDays <= 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}

/** Formats a snapshot discount amount for display — "10%" or "Rp10.000". */
export function formatDiscountAmount(type: DiscountType, value: number): string {
  if (type === "PERCENT") return `${value}%`;
  return `Rp${value.toLocaleString("id-ID")}`;
}
