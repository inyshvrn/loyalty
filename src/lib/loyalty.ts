import { prisma } from "@/lib/prisma";
import { getStoreDayBounds } from "@/lib/store-time";

export const DEFAULT_STAMP_THRESHOLD = 7;

export async function getStampThreshold(): Promise<number> {
  const setting = await prisma.loyaltySetting.findUnique({ where: { id: 1 } });
  return setting?.stampThreshold ?? DEFAULT_STAMP_THRESHOLD;
}

/** Where current-cycle progress starts counting from — the most recent
 * confirmed claim's progressCutoffAt (a cancelled claim doesn't count as a
 * reset). Usually the claim's own timestamp, but backdated to the
 * threshold-th stamp when that claim was delayed past the threshold by one
 * grace stamp, so that extra stamp still counts toward this cycle instead
 * of having been silently discarded. */
export async function getProgressCutoff(customerId: string): Promise<Date | null> {
  const last = await prisma.rewardClaim.findFirst({
    where: { customerId, status: "CONFIRMED" },
    orderBy: { claimedAt: "desc" },
  });
  return last?.progressCutoffAt ?? null;
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
  const lastClaimAt = await getProgressCutoff(customerId);
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

export type BaristaActivityStats = {
  totalStamps: number;
  totalClaims: number;
  stampsThisMonth: number;
  claimsThisMonth: number;
};

/** Shown in a barista's account menu — how much they've personally done,
 * both all-time and this month. */
export async function getBaristaActivityStats(
  baristaId: string
): Promise<BaristaActivityStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [totalStamps, totalClaims, stampsThisMonth, claimsThisMonth] =
    await Promise.all([
      prisma.stamp.count({ where: { scannedByBaristaId: baristaId } }),
      prisma.rewardClaim.count({
        where: { confirmedByBaristaId: baristaId, status: "CONFIRMED" },
      }),
      prisma.stamp.count({
        where: {
          scannedByBaristaId: baristaId,
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }),
      prisma.rewardClaim.count({
        where: {
          confirmedByBaristaId: baristaId,
          status: "CONFIRMED",
          claimedAt: { gte: monthStart, lt: monthEnd },
        },
      }),
    ]);

  return { totalStamps, totalClaims, stampsThisMonth, claimsThisMonth };
}

/** A barista's currently assigned outlet name (not their confirmed-this-
 * session status — see proxy.ts / auth.config.ts for that), shown in the
 * Akun menu so they know what's set before deciding whether to switch. */
export async function getBaristaOutletName(
  baristaId: string
): Promise<string | null> {
  const barista = await prisma.user.findUnique({
    where: { id: baristaId },
    select: { outlet: { select: { name: true } } },
  });
  return barista?.outlet?.name ?? null;
}

/** Admin-only variants of the customer history — include who performed the
 * action. Kept separate from getRecentStamps/getRecentClaims (used on the
 * customer-facing dashboard/history pages) so staff names are never fetched
 * for, or exposed to, a customer's own view. */
export function getRecentStampsWithStaff(customerId: string, limit = 10) {
  return prisma.stamp.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      scannedByBarista: { select: { name: true } },
      outlet: { select: { name: true } },
    },
  });
}

export function getRecentClaimsWithStaff(customerId: string, limit = 10) {
  return prisma.rewardClaim.findMany({
    where: { customerId },
    orderBy: { claimedAt: "desc" },
    take: limit,
    include: {
      confirmedByBarista: { select: { name: true } },
      cancelledByAdmin: { select: { name: true } },
    },
  });
}

/** Every customer's current stamp count in one query instead of two
 * per customer (their last confirmed claim's progressCutoffAt, then a count
 * of stamps after it) — a LATERAL join finds each customer's own cutoff
 * inline, so this scales as one round trip regardless of customer count.
 * Used anywhere that needs this for every customer at once (the dashboard's
 * eligible count, the admin customer list) instead of the N+1 pattern of
 * calling getCustomerProgressWithThreshold per row. */
export async function getAllCustomerStampCounts(): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ customerId: string; stamps: bigint }[]>`
    SELECT
      u.id AS "customerId",
      COUNT(s.id) FILTER (
        WHERE s."createdAt" > COALESCE(rc."progressCutoffAt", '-infinity'::timestamp)
      ) AS stamps
    FROM "User" u
    LEFT JOIN LATERAL (
      SELECT "progressCutoffAt"
      FROM "RewardClaim"
      WHERE "customerId" = u.id AND status = 'CONFIRMED'
      ORDER BY "claimedAt" DESC
      LIMIT 1
    ) rc ON true
    LEFT JOIN "Stamp" s ON s."customerId" = u.id
    WHERE u.role = 'CUSTOMER'
    GROUP BY u.id, rc."progressCutoffAt"
  `;
  return new Map(rows.map((r) => [r.customerId, Number(r.stamps)]));
}

export async function countEligibleCustomers() {
  const [threshold, stampCounts] = await Promise.all([
    getStampThreshold(),
    getAllCustomerStampCounts(),
  ]);
  let count = 0;
  for (const stamps of stampCounts.values()) {
    if (stamps >= threshold) count++;
  }
  return count;
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

export function countPendingStampGrantRequests() {
  return prisma.stampGrantRequest.count({ where: { status: "PENDING" } });
}

/** Pending requests first (oldest first, so the queue clears in submission
 * order), then a recent slice of already-reviewed ones for context. */
export async function getStampGrantRequests(reviewedLimit = 20) {
  const [pending, reviewed] = await Promise.all([
    prisma.stampGrantRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        requestedByUser: { select: { name: true, role: true } },
        outlet: { select: { name: true } },
      },
    }),
    prisma.stampGrantRequest.findMany({
      where: { NOT: { status: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: reviewedLimit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        requestedByUser: { select: { name: true, role: true } },
        reviewedByAdmin: { select: { name: true } },
        outlet: { select: { name: true } },
      },
    }),
  ]);
  return { pending, reviewed };
}

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
