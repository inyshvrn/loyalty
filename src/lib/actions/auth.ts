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
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  passwordFingerprint,
} from "@/lib/password-reset-token";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { roleHome } from "@/lib/role-home";
import { phoneSchema } from "@/lib/validators";

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
  phone: phoneSchema,
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
      const phoneTaken = await prisma.user.findFirst({ where: { phone } });
      if (phoneTaken) {
        return { error: "Nomor HP ini sudah terdaftar di akun lain." };
      }

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
      if (error.code === "account_deactivated") {
        return {
          error: "Akun ini sudah dinonaktifkan. Hubungi admin jika ini keliru.",
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

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
});

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email tidak valid" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (user) {
      const token = await createPasswordResetToken(
        user.id,
        user.email,
        user.passwordHash
      );
      await sendPasswordResetEmail(
        user.email,
        `${baseUrl}/reset-password?token=${token}`
      );
    }
  } catch (err) {
    console.error("Forgot password failed:", err);
    // Fall through to the same generic message — don't leak failure detail.
  }

  // Same response whether or not the email exists, so this can't be used to
  // enumerate registered accounts.
  return {
    success:
      "Jika email tersebut terdaftar, tautan atur ulang kata sandi sudah dikirim.",
  };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const { token, password } = parsed.data;

  let payload;
  try {
    payload = await verifyPasswordResetToken(token);
  } catch {
    return {
      error: "Tautan atur ulang kata sandi tidak valid atau sudah kedaluwarsa.",
    };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (
    !user ||
    user.email !== payload.email ||
    passwordFingerprint(user.passwordHash) !== payload.pwdFp
  ) {
    // Either the account is gone, or this link was already used once before
    // (the fingerprint no longer matches the current password hash).
    return {
      error: "Tautan atur ulang kata sandi tidak valid atau sudah dipakai.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  redirect("/login?reset=success");
}
