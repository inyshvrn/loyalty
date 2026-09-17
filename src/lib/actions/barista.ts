"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, unstable_update } from "@/lib/auth";
import {
  getStampThreshold,
  getProgressCutoff,
  getStampCountSince,
  createGrantedStamps,
} from "@/lib/loyalty";
import { getStoreDayBounds, formatStoreTime } from "@/lib/store-time";
import { sortByNameInsensitive } from "@/lib/utils";
import type { User } from "@/generated/prisma/client";

async function requireBarista() {
  const session = await auth();
  if (!session?.user || session.user.role !== "BARISTA") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

/** Called once per login from /scan/pilih-outlet — persists the choice as
 * this barista's outlet (so addStampAction, which reads it fresh from the
 * DB per scan, picks it up) and marks the session as confirmed so the
 * proxy stops redirecting here until their next fresh sign-in. `outletId`
 * is null only when there's nothing to pick yet (no outlets configured) —
 * that just confirms the session without assigning one. */
export async function confirmBaristaOutletAction(outletId: string | null) {
  const barista = await requireBarista();

  if (outletId) {
    const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
    if (!outlet) {
      throw new Error("Outlet tidak ditemukan.");
    }
    await prisma.user.update({ where: { id: barista.id }, data: { outletId } });
  }

  await unstable_update({ user: { outletConfirmed: true } });

  redirect("/scan");
}

const nameSchema = z.string().trim().min(2, "Nama minimal 2 karakter").max(100);

export type UpdateOwnNameResult = { ok: true } | { ok: false; error: string };

/** Self-service — a barista renaming themselves, from the Akun menu. Pushes
 * the new name into the session via unstable_update so it shows up right
 * away, without needing to log out and back in. */
export async function updateOwnNameAction(name: string): Promise<UpdateOwnNameResult> {
  const barista = await requireBarista();

  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Nama tidak valid." };
  }

  await prisma.user.update({ where: { id: barista.id }, data: { name: parsed.data } });
  await unstable_update({ user: { name: parsed.data } });

  return { ok: true };
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Masukkan kata sandi lama."),
  newPassword: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});

export type UpdateOwnPasswordResult = { ok: true } | { ok: false; error: string };

/** Self-service — a barista setting their own password from the Akun menu,
 * without needing to ask an admin. Requires the current password first, so
 * a device left unlocked/logged-in for a moment can't be hijacked by
 * setting a new password without ever knowing the old one. */
export async function updateOwnPasswordAction(
  currentPassword: string,
  newPassword: string
): Promise<UpdateOwnPasswordResult> {
  const barista = await requireBarista();

  const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const user = await prisma.user.findUnique({
    where: { id: barista.id },
    select: { passwordHash: true },
  });
  if (!user) {
    return { ok: false, error: "Akun tidak ditemukan." };
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    return { ok: false, error: "Kata sandi lama salah." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: barista.id }, data: { passwordHash } });

  return { ok: true };
}

export type CustomerStatus = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  stamps: number;
  threshold: number;
  eligible: boolean;
  /** True only for a customer who has never received a single Stamp — the
   * one case an initial bulk grant (physical-card transfer) makes sense. */
  eligibleForInitialGrant: boolean;
  pendingGrantRequest: { id: string; count: number; createdAt: Date } | null;
};

async function buildCustomerStatus(customer: User): Promise<CustomerStatus> {
  const [threshold, lastClaimAt, everStampCount, pendingGrant] = await Promise.all([
    getStampThreshold(),
    getProgressCutoff(customer.id),
    prisma.stamp.count({ where: { customerId: customer.id } }),
    prisma.stampGrantRequest.findFirst({
      where: { customerId: customer.id, status: "PENDING" },
      select: { id: true, count: true, createdAt: true },
    }),
  ]);
  const stamps = await getStampCountSince(customer.id, lastClaimAt);
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    emailVerified: customer.emailVerified,
    stamps,
    threshold,
    eligible: stamps >= threshold,
    eligibleForInitialGrant: everStampCount === 0 && !pendingGrant,
    pendingGrantRequest: pendingGrant,
  };
}

const searchSchema = z.string().trim().max(100);

/** Empty query lists every customer alphabetically instead of nothing, so
 * the manual-search tab doubles as a browsable directory. */
export async function searchCustomersAction(
  query: string
): Promise<CustomerStatus[]> {
  await requireBarista();

  const parsed = searchSchema.safeParse(query);
  if (!parsed.success) return [];

  const q = parsed.data;
  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    },
    take: 50,
    orderBy: { name: "asc" },
  });

  return Promise.all(sortByNameInsensitive(customers).map(buildCustomerStatus));
}

export type AddStampResult =
  | { ok: true; stampAdded: true; data: CustomerStatus }
  | { ok: true; stampAdded: false; reason: string; data: CustomerStatus }
  | { ok: false; error: string };

export async function addStampAction(customerId: string): Promise<AddStampResult> {
  const barista = await requireBarista();

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return {
      ok: false,
      error: "Pelanggan tidak ditemukan. Pastikan QR valid atau coba cari manual.",
    };
  }

  if (!customer.emailVerified) {
    const data = await buildCustomerStatus(customer);
    return {
      ok: true,
      stampAdded: false,
      reason: "Pelanggan belum verifikasi email — belum bisa dapat stempel.",
      data,
    };
  }

  const { start, end } = getStoreDayBounds();
  const existing = await prisma.stamp.findFirst({
    where: { customerId, createdAt: { gte: start, lt: end } },
  });

  if (existing) {
    const data = await buildCustomerStatus(customer);
    return {
      ok: true,
      stampAdded: false,
      reason: `Sudah dapat stempel hari ini pukul ${formatStoreTime(existing.createdAt)}.`,
      data,
    };
  }

  // Allow exactly one grace stamp past the threshold (so a customer who
  // returns before claiming isn't turned away) — beyond that, further
  // stamps must wait until the reward is confirmed, or they'd just be lost
  // when progress resets on claim.
  const [threshold, cutoff] = await Promise.all([
    getStampThreshold(),
    getProgressCutoff(customerId),
  ]);
  const stampsSoFar = await getStampCountSince(customerId, cutoff);
  if (stampsSoFar > threshold) {
    const data = await buildCustomerStatus(customer);
    return {
      ok: true,
      stampAdded: false,
      reason: "Pelanggan sudah siap klaim reward (+1 stempel bonus) — konfirmasi reward-nya dulu sebelum nambah stempel lagi.",
      data,
    };
  }

  const scanningBarista = await prisma.user.findUnique({
    where: { id: barista.id },
    select: { outletId: true },
  });

  await prisma.stamp.create({
    data: {
      customerId,
      scannedByBaristaId: barista.id,
      outletId: scanningBarista?.outletId ?? null,
    },
  });

  const data = await buildCustomerStatus(customer);
  return { ok: true, stampAdded: true, data };
}

export type ConfirmRewardResult =
  | { ok: true; data: CustomerStatus }
  | { ok: false; error: string };

export async function confirmRewardAction(
  customerId: string
): Promise<ConfirmRewardResult> {
  const barista = await requireBarista();

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { ok: false, error: "Pelanggan tidak ditemukan." };
  }

  const [threshold, cutoff] = await Promise.all([
    getStampThreshold(),
    getProgressCutoff(customerId),
  ]);
  // Fetch the oldest `threshold` stamps since the cutoff (ascending) rather
  // than just a count — the last one in that set is the threshold-th stamp,
  // whose createdAt becomes the new progressCutoffAt. Anything after it
  // (the one allowed grace stamp, if the claim was delayed) stays uncounted
  // here and carries over to the next cycle instead of being lost.
  const stampsSinceCutoff = await prisma.stamp.findMany({
    where: { customerId, ...(cutoff ? { createdAt: { gt: cutoff } } : {}) },
    orderBy: { createdAt: "asc" },
    take: threshold,
  });

  if (stampsSinceCutoff.length < threshold) {
    return {
      ok: false,
      error: "Pelanggan belum mencapai jumlah stempel yang cukup.",
    };
  }
  const thresholdStamp = stampsSinceCutoff[threshold - 1];

  await prisma.rewardClaim.create({
    data: {
      customerId,
      confirmedByBaristaId: barista.id,
      progressCutoffAt: thresholdStamp.createdAt,
    },
  });

  const data = await buildCustomerStatus(customer);
  return { ok: true, data };
}

export type ClaimHistorySummary = {
  totalClaims: number;
  lastClaimAt: Date | null;
};

/** Fetched on demand when a barista opens the confirm-reward dialog — not
 * part of CustomerStatus, since that's built for every row in a (now up to
 * 50-long) search list and this would add a query per row for something
 * only needed for the one customer actually being confirmed. */
export async function getClaimHistorySummary(
  customerId: string
): Promise<ClaimHistorySummary> {
  await requireBarista();

  const [totalClaims, last] = await Promise.all([
    prisma.rewardClaim.count({ where: { customerId, status: "CONFIRMED" } }),
    prisma.rewardClaim.findFirst({
      where: { customerId, status: "CONFIRMED" },
      orderBy: { claimedAt: "desc" },
      select: { claimedAt: true },
    }),
  ]);

  return { totalClaims, lastClaimAt: last?.claimedAt ?? null };
}

// ---- Initial stamp grant (physical card transfer) ----

const initialGrantSchema = z.object({
  count: z
    .coerce.number()
    .int()
    .min(2, "Minimal 2 stempel — untuk 1 stempel pakai tombol Tambah Stempel biasa")
    .max(200, "Maksimal 200 stempel sekali ajuan"),
  note: z.string().trim().max(300).optional(),
});

export type RequestInitialGrantResult =
  | { ok: true; data: CustomerStatus }
  | { ok: false; error: string };

/** Submitted by a barista for a customer who's transferring stamps from an
 * old paper punch card. The stamps apply immediately — the customer's
 * progress reflects them right away — but an admin still has to check the
 * physical card and can cancel it (see cancelStampGrantRequestAction in
 * admin.ts) if it turns out not to check out. Only allowed while the
 * customer has never received a single stamp, so it can't be reused as a
 * shortcut for extra stamps later. */
export async function requestInitialStampGrantAction(
  customerId: string,
  count: number,
  note?: string
): Promise<RequestInitialGrantResult> {
  const barista = await requireBarista();

  const parsed = initialGrantSchema.safeParse({ count, note });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { ok: false, error: "Pelanggan tidak ditemukan." };
  }

  const [everStampCount, pending, scanningBarista] = await Promise.all([
    prisma.stamp.count({ where: { customerId } }),
    prisma.stampGrantRequest.findFirst({ where: { customerId, status: "PENDING" } }),
    prisma.user.findUnique({ where: { id: barista.id }, select: { outletId: true } }),
  ]);
  if (everStampCount > 0) {
    return {
      ok: false,
      error: "Pelanggan ini sudah pernah dapat stempel — bukan lagi kunjungan pertama.",
    };
  }
  if (pending) {
    return {
      ok: false,
      error: "Sudah ada ajuan yang masih menunggu approval admin untuk pelanggan ini.",
    };
  }

  const outletId = scanningBarista?.outletId ?? null;
  const request = await prisma.stampGrantRequest.create({
    data: {
      customerId,
      count: parsed.data.count,
      note: parsed.data.note || null,
      requestedByUserId: barista.id,
      outletId,
    },
  });
  await createGrantedStamps(customerId, barista.id, outletId, parsed.data.count, request.id);

  const data = await buildCustomerStatus(customer);
  return { ok: true, data };
}
