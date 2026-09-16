import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getBaristaActivityStats, getBaristaOutletName } from "@/lib/loyalty";
import { AkunView } from "@/components/barista/akun-view";

export default async function BaristaAkunPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [stats, outletName] = await Promise.all([
    getBaristaActivityStats(session.user.id),
    getBaristaOutletName(session.user.id),
  ]);

  return (
    <AkunView
      name={session.user.name ?? ""}
      email={session.user.email ?? ""}
      stats={stats}
      outletName={outletName}
    />
  );
}
