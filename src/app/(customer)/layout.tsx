import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/role-home";
import { CustomerShell } from "@/components/layouts/customer-shell";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "CUSTOMER") redirect(roleHome[session.user.role]);

  return (
    <CustomerShell
      user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}
    >
      {children}
    </CustomerShell>
  );
}
