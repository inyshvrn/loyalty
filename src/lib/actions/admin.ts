"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStoreDayBounds, formatStoreTime } from "@/lib/store-time";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export type ActionState = { error?: string; success?: string } | null;

// ---- Barista account management ----

const createBaristaSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export async function createBaristaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = createBaristaSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Email ini sudah terdaftar." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "BARISTA",
      emailVerified: true, // staff accounts skip self-verification
    },
  });

  revalidatePath("/admin/baristas");
  return { success: `Akun barista ${parsed.data.name} dibuat.` };
}

export async function setBaristaActiveAction(userId: string, isActive: boolean) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "BARISTA") {
    throw new Error("Akun barista tidak ditemukan.");
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive } });
  revalidatePath("/admin/baristas");
}

// ---- Threshold setting ----

const thresholdSchema = z.coerce.number().int().min(1, "Minimal 1 stempel").max(1000);

export async function updateThresholdAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = thresholdSchema.safeParse(formData.get("threshold"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nilai tidak valid" };
  }

  await prisma.loyaltySetting.upsert({
    where: { id: 1 },
    update: { stampThreshold: parsed.data },
    create: { id: 1, stampThreshold: parsed.data },
  });

  revalidatePath("/admin/settings");
  return { success: `Target stempel diperbarui menjadi ${parsed.data}.` };
}

// ---- Customer manual correction ----

export type CorrectionResult = { ok: true } | { ok: false; error: string };

export async function addManualStampAction(customerId: string): Promise<CorrectionResult> {
  const admin = await requireAdmin();

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { ok: false, error: "Pelanggan tidak ditemukan." };
  }

  const { start, end } = getStoreDayBounds();
  const existing = await prisma.stamp.findFirst({
    where: { customerId, createdAt: { gte: start, lt: end } },
  });
  if (existing) {
    return {
      ok: false,
      error: `Pelanggan ini sudah dapat stempel hari ini pukul ${formatStoreTime(existing.createdAt)}.`,
    };
  }

  await prisma.stamp.create({
    data: { customerId, scannedByBaristaId: admin.id },
  });

  revalidatePath(`/admin/customers/${customerId}`);
  return { ok: true };
}

export async function removeStampAction(stampId: string): Promise<CorrectionResult> {
  await requireAdmin();

  const stamp = await prisma.stamp.findUnique({ where: { id: stampId } });
  if (!stamp) {
    return { ok: false, error: "Stempel tidak ditemukan." };
  }

  await prisma.stamp.delete({ where: { id: stampId } });

  revalidatePath(`/admin/customers/${stamp.customerId}`);
  return { ok: true };
}

export async function cancelClaimAction(claimId: string): Promise<CorrectionResult> {
  const admin = await requireAdmin();

  const claim = await prisma.rewardClaim.findUnique({ where: { id: claimId } });
  if (!claim) {
    return { ok: false, error: "Klaim tidak ditemukan." };
  }
  if (claim.status === "CANCELLED") {
    return { ok: false, error: "Klaim ini sudah dibatalkan sebelumnya." };
  }

  await prisma.rewardClaim.update({
    where: { id: claimId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
      cancelledByAdminId: admin.id,
    },
  });

  revalidatePath(`/admin/customers/${claim.customerId}`);
  return { ok: true };
}
