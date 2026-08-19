import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSessionUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// Re-declared locally to avoid importing DefaultSession just for this shape.
type DefaultSessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

/**
 * Edge-safe base config — no Prisma/bcrypt here. `middleware.ts` runs in the
 * Edge runtime and can only use this (it needs to decode the session JWT,
 * not authenticate credentials). The full Credentials provider is added on
 * top of this in `auth.ts`, which only ever runs in the Node runtime.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};
