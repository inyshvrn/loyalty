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
