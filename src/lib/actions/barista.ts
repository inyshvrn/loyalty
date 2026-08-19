"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
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

export type CustomerStatus = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  stamps: number;
  threshold: number;
  eligible: boolean;
};

async function buildCustomerStatus(customer: User): Promise<CustomerStatus> {
  const [threshold, lastClaimAt] = await Promise.all([
    getStampThreshold(),
    getLastConfirmedClaimAt(customer.id),
  ]);
  const stamps = await getStampCountSince(customer.id, lastClaimAt);
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    stamps,
    threshold,
    eligible: stamps >= threshold,
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

  await prisma.stamp.create({
    data: { customerId, scannedByBaristaId: barista.id },
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
