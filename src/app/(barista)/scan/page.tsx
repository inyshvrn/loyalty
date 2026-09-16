import { auth } from "@/lib/auth";
import { getBaristaActivityStats } from "@/lib/loyalty";
import { ScanView } from "@/components/barista/scan-view";

export default async function ScanPage() {
  const session = await auth();
  const stats = session?.user?.id
    ? await getBaristaActivityStats(session.user.id)
    : undefined;

  return (
    <ScanView
      user={{ name: session?.user?.name ?? "", email: session?.user?.email ?? "" }}
      stats={stats}
    />
  );
}
