import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

class AccountDeactivatedError extends CredentialsSignin {
  code = "account_deactivated";
}

// After this many failed attempts in a row, the account is locked out for
// LOCKOUT_DURATION_MS — checked before the password comparison even runs,
// so it also blocks a *correct* password until the window passes. Rendered
// as the same generic "wrong credentials" message as InvalidCredentialsError
// (see loginAction) rather than a distinct "locked" message, so a locked-out
// account can't be told apart from a wrong password by someone probing
// emails they don't know are registered.
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          throw new InvalidCredentialsError();
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (user?.lockedUntil && user.lockedUntil > new Date()) {
          // Rejected before ever touching the password — a correct one
          // doesn't get through either until the window passes.
          throw new InvalidCredentialsError();
        }

        // Compare against a dummy hash when the user doesn't exist, so the
        // response time doesn't leak whether the email is registered.
        const hashToCompare =
          user?.passwordHash ??
          "$2a$12$CwTycUXWue0Thq9StjUM0uJ8eXAmHz3T8MZ4wRk9C0v/DvS0X.5wu";
        const passwordMatches = await bcrypt.compare(password, hashToCompare);

        if (!user || !passwordMatches) {
          if (user) {
            const attempts = user.failedLoginAttempts + 1;
            await prisma.user.update({
              where: { id: user.id },
              data:
                attempts >= MAX_FAILED_ATTEMPTS
                  ? {
                      failedLoginAttempts: 0,
                      lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
                    }
                  : { failedLoginAttempts: attempts },
            });
          }
          throw new InvalidCredentialsError();
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        if (!user.isActive) {
          throw new AccountDeactivatedError();
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
