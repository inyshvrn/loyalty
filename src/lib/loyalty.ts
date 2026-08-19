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

/** Same as getCustomerProgress, but reuses an already-fetched threshold —
 * useful when computing progress for many customers at once (admin pages)
 * so the singleton LoyaltySetting isn't re-queried per customer. */
export async function getCustomerProgressWithThreshold(
  customerId: string,
  threshold: number
): Promise<CustomerProgress> {
  const lastClaimAt = await getLastConfirmedClaimAt(customerId);
  const stamps = await getStampCountSince(customerId, lastClaimAt);
  return { stamps, threshold, eligible: stamps >= threshold, lastClaimAt };
}

/** Current stamp progress — derived from Stamp rows since the last confirmed claim. */
export async function getCustomerProgress(customerId: string): Promise<CustomerProgress> {
  const threshold = await getStampThreshold();
  return getCustomerProgressWithThreshold(customerId, threshold);
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

// ---- Admin-facing aggregates ----

export function countTotalCustomers() {
  return prisma.user.count({ where: { role: "CUSTOMER" } });
}

export async function countStampsToday() {
  const { start, end } = getStoreDayBounds();
  return prisma.stamp.count({ where: { createdAt: { gte: start, lt: end } } });
}

export async function countConfirmedClaimsThisMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return prisma.rewardClaim.count({
    where: { status: "CONFIRMED", claimedAt: { gte: start, lt: end } },
  });
}

/** Loops all customers to check eligibility — fine at this app's scale (a
 * single coffee shop's customer list), and simpler/more correct than trying
 * to express a per-customer "since last claim" cutoff in one aggregate query. */
export async function countEligibleCustomers() {
  const [threshold, customers] = await Promise.all([
    getStampThreshold(),
    prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true } }),
  ]);
  const results = await Promise.all(
    customers.map((c) => getCustomerProgressWithThreshold(c.id, threshold))
  );
  return results.filter((r) => r.eligible).length;
}

export type ActivityEntry =
  | { type: "stamp"; id: string; customerName: string; at: Date }
  | {
      type: "claim";
      id: string;
      customerName: string;
      at: Date;
      status: "CONFIRMED" | "CANCELLED";
    };

export async function getRecentActivity(limit = 10): Promise<ActivityEntry[]> {
  const [stamps, claims] = await Promise.all([
    prisma.stamp.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { customer: { select: { name: true } } },
    }),
    prisma.rewardClaim.findMany({
      orderBy: { claimedAt: "desc" },
      take: limit,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  const entries: ActivityEntry[] = [
    ...stamps.map((s) => ({
      type: "stamp" as const,
      id: s.id,
      customerName: s.customer.name,
      at: s.createdAt,
    })),
    ...claims.map((c) => ({
      type: "claim" as const,
      id: c.id,
      customerName: c.customer.name,
      at: c.claimedAt,
      status: c.status,
    })),
  ];

  return entries.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
