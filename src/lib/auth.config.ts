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
      /** Baristas only — whether they've picked an outlet for *this* login
       * session yet. Reset to false on every fresh sign-in (see the `jwt`
       * callback below) so a barista who's moved outlets since their last
       * session is asked again, rather than silently reusing a stale
       * choice from days ago. */
      outletConfirmed?: boolean;
    } & DefaultSessionUser;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
    outletConfirmed?: boolean;
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
    jwt({ token, user, trigger, session }) {
      if (user?.id) {
        // Fresh sign-in: always start unconfirmed, regardless of whatever
        // outlet was picked in a previous session.
        token.id = user.id;
        token.role = user.role;
        token.outletConfirmed = false;
      }
      if (trigger === "update" && session?.user?.outletConfirmed) {
        token.outletConfirmed = true;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.outletConfirmed = token.outletConfirmed;
      return session;
    },
  },
};
