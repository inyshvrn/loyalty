import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { roleHome } from "@/lib/role-home";
import { BaristaShell } from "@/components/layouts/barista-shell";

export default async function BaristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "BARISTA") redirect(roleHome[session.user.role]);

  return (
    <BaristaShell
      user={{ name: session.user.name ?? "", email: session.user.email ?? "" }}
    >
      {children}
    </BaristaShell>
  );
}
