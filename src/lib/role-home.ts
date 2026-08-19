import type { Role } from "@/generated/prisma/client";

/** Where each role lands after login, and where cross-role access gets redirected. */
export const roleHome: Record<Role, string> = {
  CUSTOMER: "/dashboard",
  BARISTA: "/scan",
  ADMIN: "/admin/dashboard",
};
