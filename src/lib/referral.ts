import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@/generated/prisma/client";

export const DEFAULT_REFERRAL_DISCOUNT_TYPE: DiscountType = "PERCENT";
export const DEFAULT_REFERRAL_DISCOUNT_VALUE = 10;

// Excludes 0/O and 1/I/L — easy to read back over a counter without
// transcription errors. ~34 billion combinations at length 7, more than
// enough headroom for a single shop that collisions are effectively never
// going to happen in practice.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 7;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** Called once per new CUSTOMER row (self-registration or admin
 * migration) — never for barista/admin accounts. Retries on the rare
 * chance of a collision; the @unique constraint on User.referralCode is
 * the real backstop. */
export async function createUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  throw new Error("Gagal membuat kode referral unik. Coba lagi.");
}

export type ReferralDiscountSetting = {
  discountType: DiscountType;
  discountValue: number;
};

export async function getReferralDiscountSetting(): Promise<ReferralDiscountSetting> {
  const setting = await prisma.loyaltySetting.findUnique({ where: { id: 1 } });
  return {
    discountType: setting?.referralDiscountType ?? DEFAULT_REFERRAL_DISCOUNT_TYPE,
    discountValue: setting?.referralDiscountValue ?? DEFAULT_REFERRAL_DISCOUNT_VALUE,
  };
}

export type ReferralStats = {
  code: string | null;
  referralCount: number;
  availableCredits: number;
};

export async function getReferralStats(customerId: string): Promise<ReferralStats> {
  const [user, referralCount, availableCredits] = await Promise.all([
    prisma.user.findUnique({ where: { id: customerId }, select: { referralCode: true } }),
    prisma.user.count({ where: { referredById: customerId } }),
    prisma.referralCredit.count({ where: { referrerId: customerId, status: "AVAILABLE" } }),
  ]);

  // Self-healing backfill: any customer who registered before this feature
  // shipped has no code yet. Generate one the first time their stats are
  // read (dashboard visit) instead of needing a one-off migration script.
  let code = user?.referralCode ?? null;
  if (!code) {
    code = await createUniqueReferralCode();
    await prisma.user.update({ where: { id: customerId }, data: { referralCode: code } });
  }

  return { code, referralCount, availableCredits };
}

export function getReferralCreditsForCustomer(customerId: string, limit = 50) {
  return prisma.referralCredit.findMany({
    where: { referrerId: customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Same list, with the extra relations the admin customer-detail page needs
 * to show who was referred and who redeemed/cancelled each credit. */
export function getReferralCreditsForAdmin(customerId: string, limit = 50) {
  return prisma.referralCredit.findMany({
    where: { referrerId: customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      referredUser: { select: { name: true, email: true } },
      redeemedByBarista: { select: { name: true } },
      outlet: { select: { name: true } },
      cancelledByAdmin: { select: { name: true } },
    },
  });
}
