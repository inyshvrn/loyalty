import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminAkunView } from "@/components/admin/akun-view";

export default async function AdminAkunPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AdminAkunView name={session.user.name ?? ""} email={session.user.email ?? ""} />
  );
}
