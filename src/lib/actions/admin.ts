"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getStoreDayBounds, formatStoreTime } from "@/lib/store-time";
import { phoneSchema } from "@/lib/validators";

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
  outletId: z.union([z.literal(""), z.string().min(1)]),
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
    outletId: formData.get("outletId") ?? "",
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
      outletId: parsed.data.outletId || null,
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

const updateBaristaSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.union([z.literal(""), z.string().min(8, "Kata sandi minimal 8 karakter")]),
  outletId: z.union([z.literal(""), z.string().min(1)]),
});

export async function updateBaristaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = updateBaristaSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") ?? "",
    outletId: formData.get("outletId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { userId, name, email, password, outletId } = parsed.data;

  const barista = await prisma.user.findUnique({ where: { id: userId } });
  if (!barista || barista.role !== "BARISTA") {
    return { error: "Akun barista tidak ditemukan." };
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (emailTaken) {
    return { error: "Email ini sudah dipakai akun lain." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      email,
      outletId: outletId || null,
      ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
    },
  });

  revalidatePath("/admin/baristas");
  return { success: `Akun barista ${name} diperbarui.` };
}

export async function deleteBaristaAction(userId: string): Promise<CorrectionResult> {
  await requireAdmin();

  const barista = await prisma.user.findUnique({ where: { id: userId } });
  if (!barista || barista.role !== "BARISTA") {
    return { ok: false, error: "Akun barista tidak ditemukan." };
  }

  const [stampCount, claimCount] = await Promise.all([
    prisma.stamp.count({ where: { scannedByBaristaId: userId } }),
    prisma.rewardClaim.count({ where: { confirmedByBaristaId: userId } }),
  ]);
  if (stampCount > 0 || claimCount > 0) {
    return {
      ok: false,
      error:
        "Barista ini sudah punya riwayat scan/klaim — tidak bisa dihapus permanen agar riwayat tetap utuh. Nonaktifkan saja akunnya.",
    };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/baristas");
  return { ok: true };
}

// ---- Outlet management ----

const outletNameSchema = z.string().trim().min(2, "Nama outlet minimal 2 karakter").max(100);

export async function createOutletAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = outletNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nama tidak valid" };
  }

  await prisma.outlet.create({ data: { name: parsed.data } });

  revalidatePath("/admin/outlets");
  revalidatePath("/admin/baristas");
  return { success: `Outlet ${parsed.data} ditambahkan.` };
}

const updateOutletSchema = z.object({
  outletId: z.string().min(1),
  name: outletNameSchema,
});

export async function updateOutletAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = updateOutletSchema.safeParse({
    outletId: formData.get("outletId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const outlet = await prisma.outlet.findUnique({ where: { id: parsed.data.outletId } });
  if (!outlet) {
    return { error: "Outlet tidak ditemukan." };
  }

  await prisma.outlet.update({
    where: { id: parsed.data.outletId },
    data: { name: parsed.data.name },
  });

  revalidatePath("/admin/outlets");
  revalidatePath("/admin/baristas");
  return { success: `Outlet diperbarui menjadi ${parsed.data.name}.` };
}

export async function deleteOutletAction(outletId: string): Promise<CorrectionResult> {
  await requireAdmin();

  const outlet = await prisma.outlet.findUnique({ where: { id: outletId } });
  if (!outlet) {
    return { ok: false, error: "Outlet tidak ditemukan." };
  }

  const [baristaCount, stampCount] = await Promise.all([
    prisma.user.count({ where: { outletId } }),
    prisma.stamp.count({ where: { outletId } }),
  ]);
  if (baristaCount > 0 || stampCount > 0) {
    return {
      ok: false,
      error:
        "Outlet ini masih ada barista atau riwayat stempel yang terkait — pindahkan baristanya dulu sebelum menghapus.",
    };
  }

  await prisma.outlet.delete({ where: { id: outletId } });
  revalidatePath("/admin/outlets");
  return { ok: true };
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

// ---- Customer migration (paper-card customers moving to the app) ----

const migrateCustomerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  phone: phoneSchema,
  initialStamps: z.coerce.number().int().min(0, "Tidak boleh negatif").max(999),
});

export async function migrateCustomerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = migrateCustomerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    initialStamps: formData.get("initialStamps"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { name, email, phone, initialStamps } = parsed.data;

  const emailTaken = await prisma.user.findUnique({ where: { email } });
  if (emailTaken) {
    return { error: "Email ini sudah terdaftar." };
  }
  const phoneTaken = await prisma.user.findFirst({ where: { phone } });
  if (phoneTaken) {
    return { error: "Nomor HP ini sudah terdaftar di akun lain." };
  }

  // No password set here — nobody but the customer should know it. They
  // claim the account later via "Lupa kata sandi?" (same flow as any other
  // password reset), which sets a real password only they know.
  const passwordHash = await bcrypt.hash(crypto.randomUUID() + crypto.randomUUID(), 12);
  const customer = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role: "CUSTOMER",
      emailVerified: true, // admin registers them in person, no self-verification needed
    },
  });

  if (initialStamps > 0) {
    // Backdated (see createGrantedStamps below) so a real scan later today
    // — the same day this customer is migrated in — doesn't get blocked by
    // the "1 stamp per customer per day" rule.
    await createGrantedStamps(customer.id, admin.id, null, initialStamps);
  }

  revalidatePath("/admin/customers");
  return {
    success: `${name} didaftarkan${initialStamps > 0 ? ` dengan ${initialStamps} stempel awal` : ""}.`,
  };
}

// ---- Customer edit ----

const updateCustomerSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  phone: z.union([z.literal(""), phoneSchema]),
});

export async function updateCustomerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = updateCustomerSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const { userId, name, email, phone } = parsed.data;

  const customer = await prisma.user.findUnique({ where: { id: userId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { error: "Pelanggan tidak ditemukan." };
  }

  const emailTaken = await prisma.user.findFirst({
    where: { email, NOT: { id: userId } },
  });
  if (emailTaken) {
    return { error: "Email ini sudah dipakai akun lain." };
  }

  if (phone) {
    const phoneTaken = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
    });
    if (phoneTaken) {
      return { error: "Nomor HP ini sudah dipakai akun lain." };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, email, phone: phone || null },
  });

  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return { success: `Data ${name} diperbarui.` };
}

export async function deleteCustomerAction(userId: string): Promise<CorrectionResult> {
  await requireAdmin();

  const customer = await prisma.user.findUnique({ where: { id: userId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { ok: false, error: "Pelanggan tidak ditemukan." };
  }

  const [stampCount, claimCount] = await Promise.all([
    prisma.stamp.count({ where: { customerId: userId } }),
    prisma.rewardClaim.count({ where: { customerId: userId } }),
  ]);
  if (stampCount > 0 || claimCount > 0) {
    return {
      ok: false,
      error:
        "Pelanggan ini sudah punya riwayat stempel/klaim — tidak bisa dihapus permanen agar riwayat tetap utuh.",
    };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/customers");
  return { ok: true };
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

// ---- Initial stamp grants (physical card transfer) ----

/** Backdates each stamp to its own day in the past (ending yesterday, never
 * today) so a bulk historical grant never eats the customer's "1 stamp per
 * day" slot for an actual visit that happens the same day it's approved. */
async function createGrantedStamps(
  customerId: string,
  scannedByBaristaId: string,
  outletId: string | null,
  count: number
) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  await prisma.stamp.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      customerId,
      scannedByBaristaId,
      outletId,
      createdAt: new Date(now - (count - i) * dayMs),
    })),
  });
}

export async function approveStampGrantRequestAction(
  requestId: string
): Promise<CorrectionResult> {
  const admin = await requireAdmin();

  const request = await prisma.stampGrantRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    return { ok: false, error: "Ajuan tidak ditemukan." };
  }
  if (request.status !== "PENDING") {
    return { ok: false, error: "Ajuan ini sudah diproses sebelumnya." };
  }

  await createGrantedStamps(
    request.customerId,
    request.requestedByUserId,
    request.outletId,
    request.count
  );
  await prisma.stampGrantRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", reviewedByAdminId: admin.id, reviewedAt: new Date() },
  });

  revalidatePath("/admin/stamp-requests");
  revalidatePath(`/admin/customers/${request.customerId}`);
  return { ok: true };
}

export async function rejectStampGrantRequestAction(
  requestId: string
): Promise<CorrectionResult> {
  const admin = await requireAdmin();

  const request = await prisma.stampGrantRequest.findUnique({ where: { id: requestId } });
  if (!request) {
    return { ok: false, error: "Ajuan tidak ditemukan." };
  }
  if (request.status !== "PENDING") {
    return { ok: false, error: "Ajuan ini sudah diproses sebelumnya." };
  }

  await prisma.stampGrantRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", reviewedByAdminId: admin.id, reviewedAt: new Date() },
  });

  revalidatePath("/admin/stamp-requests");
  return { ok: true };
}

const adminInitialGrantSchema = z.object({
  count: z
    .coerce.number()
    .int()
    .min(2, "Minimal 2 stempel — untuk 1 stempel pakai Tambah Stempel Manual")
    .max(200, "Maksimal 200 stempel sekali pemberian"),
  note: z.string().trim().max(300).optional(),
});

/** Admin equivalent of requestInitialStampGrantAction — takes effect right
 * away since an admin doesn't need to approve their own request, but still
 * recorded as an (auto-approved) StampGrantRequest for the same audit trail. */
export async function adminGrantInitialStampsAction(
  customerId: string,
  count: number,
  note?: string
): Promise<CorrectionResult> {
  const admin = await requireAdmin();

  const parsed = adminInitialGrantSchema.safeParse({ count, note });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { ok: false, error: "Pelanggan tidak ditemukan." };
  }

  const everStampCount = await prisma.stamp.count({ where: { customerId } });
  if (everStampCount > 0) {
    return {
      ok: false,
      error: "Pelanggan ini sudah pernah dapat stempel — bukan lagi kunjungan pertama.",
    };
  }

  await createGrantedStamps(customerId, admin.id, null, parsed.data.count);
  await prisma.stampGrantRequest.create({
    data: {
      customerId,
      count: parsed.data.count,
      note: parsed.data.note || null,
      requestedByUserId: admin.id,
      status: "APPROVED",
      reviewedByAdminId: admin.id,
      reviewedAt: new Date(),
    },
  });

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/admin/stamp-requests");
  return { ok: true };
}
