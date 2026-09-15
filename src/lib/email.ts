import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      // A missing RESEND_API_KEY in production is a deploy misconfiguration.
      // Fail loudly rather than silently logging a live verification token
      // to production logs (or silently pretending the email was sent).
      throw new Error(
        "RESEND_API_KEY is not set — cannot send verification email in production."
      );
    }
    // Local development only: no Resend key configured, so log the link
    // instead so the flow can still be tested end to end without a Resend
    // account. This branch is unreachable when NODE_ENV === "production"
    // (Next.js sets this automatically for `next build`/`next start` and
    // on Vercel), so it never runs against a real deployment.
    console.log(`[dev] Verification link for ${to}: ${verifyUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Verifikasi email Anda — Handai Coffee",
    html: `
      <p>Halo,</p>
      <p>Terima kasih sudah mendaftar di Handai Coffee. Klik tautan di bawah untuk memverifikasi email Anda:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Tautan ini berlaku selama 24 jam. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>
    `,
  });

  if (error) {
    console.error("Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "RESEND_API_KEY is not set — cannot send password reset email in production."
      );
    }
    console.log(`[dev] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Atur ulang kata sandi — Handai Coffee",
    html: `
      <p>Halo,</p>
      <p>Ada permintaan buat atur ulang kata sandi akun Handai Coffee Anda. Klik tautan di bawah untuk membuat kata sandi baru:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Tautan ini berlaku selama 1 jam dan hanya bisa dipakai sekali. Jika Anda tidak meminta ini, abaikan email ini — kata sandi Anda tidak akan berubah.</p>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}
