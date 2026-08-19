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

export const { handlers, auth, signIn, signOut } = NextAuth({
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

        // Compare against a dummy hash when the user doesn't exist, so the
        // response time doesn't leak whether the email is registered.
        const hashToCompare =
          user?.passwordHash ??
          "$2a$12$CwTycUXWue0Thq9StjUM0uJ8eXAmHz3T8MZ4wRk9C0v/DvS0X.5wu";
        const passwordMatches = await bcrypt.compare(password, hashToCompare);

        if (!user || !passwordMatches) {
          throw new InvalidCredentialsError();
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
