import { prisma } from "@/lib/prisma";
import type { DiscountType } from "@/generated/prisma/client";

export const DEFAULT_BIRTHDAY_REWARD_ENABLED = false;
export const DEFAULT_BIRTHDAY_REWARD_MIN_STAMPS = 1;
export const DEFAULT_BIRTHDAY_REWARD_DISCOUNT_TYPE: DiscountType = "PERCENT";
export const DEFAULT_BIRTHDAY_REWARD_DISCOUNT_VALUE = 10;

export type BirthdayRewardSetting = {
  enabled: boolean;
  minStamps: number;
  discountType: DiscountType;
  discountValue: number;
};

export async function getBirthdayRewardSetting(): Promise<BirthdayRewardSetting> {
  const setting = await prisma.loyaltySetting.findUnique({ where: { id: 1 } });
  return {
    enabled: setting?.birthdayRewardEnabled ?? DEFAULT_BIRTHDAY_REWARD_ENABLED,
    minStamps: setting?.birthdayRewardMinStamps ?? DEFAULT_BIRTHDAY_REWARD_MIN_STAMPS,
    discountType: setting?.birthdayRewardDiscountType ?? DEFAULT_BIRTHDAY_REWARD_DISCOUNT_TYPE,
    discountValue: setting?.birthdayRewardDiscountValue ?? DEFAULT_BIRTHDAY_REWARD_DISCOUNT_VALUE,
  };
}

/** @db.Date values are UTC-midnight Date objects with no real timezone
 * meaning — UTC getters specifically, so this never shifts by a day near
 * local midnight depending on server offset. */
export function isBirthdayToday(
  dob: Date,
  today: { month: number; day: number }
): boolean {
  return dob.getUTCMonth() + 1 === today.month && dob.getUTCDate() === today.day;
}

export function getBirthdayRewardCreditsForCustomer(customerId: string, limit = 50) {
  return prisma.birthdayRewardCredit.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** Same list the admin customer-detail page needs for the "referrals" tab's
 * birthday-reward equivalent — who redeemed/cancelled each credit. */
export function getBirthdayRewardCreditsForAdmin(customerId: string, limit = 50) {
  return prisma.birthdayRewardCredit.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      redeemedByBarista: { select: { name: true } },
      outlet: { select: { name: true } },
      cancelledByAdmin: { select: { name: true } },
    },
  });
}
