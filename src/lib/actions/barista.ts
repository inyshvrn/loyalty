"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth, unstable_update } from "@/lib/auth";
import {
  getStampThreshold,
  getLastConfirmedClaimAt,
  getStampCountSince,
} from "@/lib/loyalty";
import { getStoreDayBounds, formatStoreTime } from "@/lib/store-time";
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
    getLastConfirmedClaimAt(customer.id),
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

const searchSchema = z.string().trim().min(1).max(100);

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
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    },
    take: 8,
    orderBy: { name: "asc" },
  });

  return Promise.all(customers.map(buildCustomerStatus));
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

  const [threshold, lastClaimAt] = await Promise.all([
    getStampThreshold(),
    getLastConfirmedClaimAt(customerId),
  ]);
  const stamps = await getStampCountSince(customerId, lastClaimAt);

  if (stamps < threshold) {
    return {
      ok: false,
      error: "Pelanggan belum mencapai jumlah stempel yang cukup.",
    };
  }

  await prisma.rewardClaim.create({
    data: { customerId, confirmedByBaristaId: barista.id },
  });

  const data = await buildCustomerStatus(customer);
  return { ok: true, data };
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
 * old paper punch card — instead of digitizing proof, the physical card is
 * kept offline and an admin has to sign off before the stamps count for
 * real (see StampGrantRequest in schema.prisma). Only allowed while the
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

  await prisma.stampGrantRequest.create({
    data: {
      customerId,
      count: parsed.data.count,
      note: parsed.data.note || null,
      requestedByUserId: barista.id,
      outletId: scanningBarista?.outletId ?? null,
    },
  });

  const data = await buildCustomerStatus(customer);
  return { ok: true, data };
}
