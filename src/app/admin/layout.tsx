import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/role-home";
import { countPendingStampGrantRequests } from "@/lib/loyalty";
import { AdminShell } from "@/components/layouts/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect(roleHome[session.user.role]);

  const pendingStampRequests = await countPendingStampGrantRequests();

  return (
    <AdminShell
      user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}
      pendingStampRequests={pendingStampRequests}
    >
      {children}
    </AdminShell>
  );
}
