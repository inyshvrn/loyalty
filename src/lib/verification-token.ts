import { SignJWT, jwtVerify } from "jose";

const EXPIRY = "24h";
const PURPOSE = "email-verification";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createVerificationToken(userId: string, email: string) {
  return new SignJWT({ email, purpose: PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecret());
}

export type VerificationTokenPayload = {
  userId: string;
  email: string;
};

/** Throws if the token is malformed, expired, or has an invalid signature. */
export async function verifyVerificationToken(
  token: string
): Promise<VerificationTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });

  if (
    payload.purpose !== PURPOSE ||
    typeof payload.sub !== "string" ||
    typeof payload.email !== "string"
  ) {
    throw new Error("Invalid verification token payload");
  }

  return { userId: payload.sub, email: payload.email };
}
