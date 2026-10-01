"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { dateOnlySchema } from "@/lib/validators";

async function requireCustomer() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CUSTOMER") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

const dateOfBirthSchema = dateOnlySchema.refine(
  (d) => d <= new Date(),
  "Tanggal lahir tidak boleh di masa depan."
);

export type UpdateOwnDateOfBirthResult = { ok: true } | { ok: false; error: string };

/** The one piece of their own profile a customer can self-edit — everything
 * else (name/email/phone) still requires asking a barista/admin, same as
 * before this. Scoped this narrowly because the birthday reward would
 * otherwise be unreachable for anyone who skipped the optional field at
 * registration, with no way to add it later short of an in-person ask. */
export async function updateOwnDateOfBirthAction(
  dateOfBirth: string
): Promise<UpdateOwnDateOfBirthResult> {
  const customer = await requireCustomer();

  const parsed = dateOfBirthSchema.safeParse(dateOfBirth);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Tanggal tidak valid." };
  }

  await prisma.user.update({ where: { id: customer.id }, data: { dateOfBirth: parsed.data } });
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Permanent "don't ask again" for the birthday-prompt nudge on the
 * dashboard. A temporary "remind me later" snooze is tracked client-side
 * (localStorage) instead — this action is only ever called from "Jangan
 * Tampilkan Lagi", never from snoozing. */
export async function dismissBirthdayPromptAction(): Promise<void> {
  const customer = await requireCustomer();
  await prisma.user.update({
    where: { id: customer.id },
    data: { birthdayPromptDismissedAt: new Date() },
  });
  revalidatePath("/dashboard");
}
