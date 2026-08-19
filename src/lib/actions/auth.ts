"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { CredentialsSignin } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/lib/auth";
import {
  createVerificationToken,
} from "@/lib/verification-token";
import { sendVerificationEmail } from "@/lib/email";
import { roleHome } from "@/lib/role-home";

const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

async function issueAndSendVerification(userId: string, email: string) {
  const token = await createVerificationToken(userId, email);
  await sendVerificationEmail(
    email,
    `${baseUrl}/api/verify-email?token=${token}`
  );
}

export type ActionState = { error?: string; success?: string } | null;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  phone: z.string().trim().min(8, "Nomor HP tidak valid").max(20),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});

export async function registerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Don't reveal that the account already exists — if it's unverified,
      // just send a fresh link; if it's verified, do nothing and still
      // report the same generic outcome below.
      if (!existing.emailVerified) {
        await issueAndSendVerification(existing.id, existing.email);
      }
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { name, email, phone, passwordHash, role: "CUSTOMER" },
      });
      await issueAndSendVerification(user.id, user.email);
    }
  } catch (err) {
    console.error("Registration failed:", err);
    return { error: "Terjadi kesalahan saat mendaftar. Coba lagi." };
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}

const resendSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
});

export async function resendVerificationAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resendSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email tidak valid" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (user && !user.emailVerified) {
      await issueAndSendVerification(user.id, user.email);
    }
  } catch (err) {
    console.error("Resend verification failed:", err);
    // Fall through to the same generic message — don't leak failure detail.
  }

  return {
    success:
      "Jika email tersebut terdaftar dan belum diverifikasi, tautan baru sudah dikirim.",
  };
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      if (error.code === "email_not_verified") {
        return {
          error:
            "Email belum diverifikasi. Periksa kotak masuk Anda atau kirim ulang tautan verifikasi.",
        };
      }
      return { error: "Email atau kata sandi salah." };
    }
    throw error;
  }

  // Re-fetch rather than reading the session back via auth(): the session
  // cookie signIn() just set isn't reliably visible yet within this same
  // action invocation, so relying on it here intermittently sent everyone
  // to the customer dashboard regardless of role.
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { role: true },
  });
  redirect(roleHome[user?.role ?? "CUSTOMER"]);
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
