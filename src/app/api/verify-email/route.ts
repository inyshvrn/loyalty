import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyVerificationToken } from "@/lib/verification-token";
import { getReferralDiscountSetting } from "@/lib/referral";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  const toVerifyEmail = (status: "success" | "invalid" | "missing") =>
    NextResponse.redirect(
      new URL(`/verify-email?status=${status}`, request.url)
    );

  if (!token) {
    return toVerifyEmail("missing");
  }

  try {
    const { userId, email } = await verifyVerificationToken(token);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.email !== email) {
      return toVerifyEmail("invalid");
    }

    if (!user.emailVerified) {
      // A referral credit is only granted once the referred friend's email
      // is actually verified (not at raw registration) — same anti-abuse
      // gate the app already uses for barista stamping, so a junk
      // unverified signup can't farm credits for whoever referred it.
      if (user.referredById) {
        const { discountType, discountValue } = await getReferralDiscountSetting();
        await prisma.$transaction([
          prisma.user.update({ where: { id: userId }, data: { emailVerified: true } }),
          prisma.referralCredit.create({
            data: {
              referrerId: user.referredById,
              referredUserId: user.id,
              discountType,
              discountValue,
            },
          }),
        ]);
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { emailVerified: true },
        });
      }
    }

    return toVerifyEmail("success");
  } catch {
    return toVerifyEmail("invalid");
  }
}
