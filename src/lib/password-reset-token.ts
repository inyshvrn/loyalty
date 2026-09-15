import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

const EXPIRY = "1h";
const PURPOSE = "password-reset";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

/** A short fingerprint of the user's current password hash, embedded in the
 * token so it stops working the moment the password actually changes —
 * one use per link, without needing a separate "used tokens" table. */
function passwordFingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}

export async function createPasswordResetToken(
  userId: string,
  email: string,
  currentPasswordHash: string
) {
  return new SignJWT({
    email,
    purpose: PURPOSE,
    pwdFp: passwordFingerprint(currentPasswordHash),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export type PasswordResetTokenPayload = {
  userId: string;
  email: string;
  pwdFp: string;
};

/** Throws if the token is malformed, expired, or has an invalid signature.
 * Does NOT by itself confirm the token is unused — callers must also compare
 * `pwdFp` against passwordFingerprint(currentPasswordHash). */
export async function verifyPasswordResetToken(
  token: string
): Promise<PasswordResetTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });

  if (
    payload.purpose !== PURPOSE ||
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.pwdFp !== "string"
  ) {
    throw new Error("Invalid password reset token payload");
  }

  return { userId: payload.sub, email: payload.email, pwdFp: payload.pwdFp };
}

export { passwordFingerprint };
