import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyVerificationToken } from "@/lib/verification-token";

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
      await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    }

    return toVerifyEmail("success");
  } catch {
    return toVerifyEmail("invalid");
  }
}
