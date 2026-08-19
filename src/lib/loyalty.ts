import { prisma } from "@/lib/prisma";
import { getStoreDayBounds } from "@/lib/store-time";

export const DEFAULT_STAMP_THRESHOLD = 10;

export async function getStampThreshold(): Promise<number> {
  const setting = await prisma.loyaltySetting.findUnique({ where: { id: 1 } });
  return setting?.stampThreshold ?? DEFAULT_STAMP_THRESHOLD;
}

/** Most recent confirmed claim — a cancelled claim doesn't count as a reset. */
export async function getLastConfirmedClaimAt(customerId: string): Promise<Date | null> {
  const last = await prisma.rewardClaim.findFirst({
    where: { customerId, status: "CONFIRMED" },
    orderBy: { claimedAt: "desc" },
  });
  return last?.claimedAt ?? null;
}

export async function getStampCountSince(
  customerId: string,
  since: Date | null
): Promise<number> {
  return prisma.stamp.count({
    where: { customerId, ...(since ? { createdAt: { gt: since } } : {}) },
  });
}

export type CustomerProgress = {
  stamps: number;
  threshold: number;
  eligible: boolean;
  lastClaimAt: Date | null;
};

/** Current stamp progress — derived from Stamp rows since the last confirmed claim. */
export async function getCustomerProgress(customerId: string): Promise<CustomerProgress> {
  const [threshold, lastClaimAt] = await Promise.all([
    getStampThreshold(),
    getLastConfirmedClaimAt(customerId),
  ]);
  const stamps = await getStampCountSince(customerId, lastClaimAt);
  return { stamps, threshold, eligible: stamps >= threshold, lastClaimAt };
}

export async function getStampedTodayAt(customerId: string): Promise<Date | null> {
  const { start, end } = getStoreDayBounds();
  const stamp = await prisma.stamp.findFirst({
    where: { customerId, createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "desc" },
  });
  return stamp?.createdAt ?? null;
}

export function getRecentStamps(customerId: string, limit = 10) {
  return prisma.stamp.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getRecentClaims(customerId: string, limit = 10) {
  return prisma.rewardClaim.findMany({
    where: { customerId },
    orderBy: { claimedAt: "desc" },
    take: limit,
  });
}
