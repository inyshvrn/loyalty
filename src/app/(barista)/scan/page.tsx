import { auth } from "@/lib/auth";
import { getBaristaActivityStats, getBaristaOutletName } from "@/lib/loyalty";
import { ScanView } from "@/components/barista/scan-view";

export default async function ScanPage() {
  const session = await auth();
  const baristaId = session?.user?.id;
  const [stats, outletName] = baristaId
    ? await Promise.all([
        getBaristaActivityStats(baristaId),
        getBaristaOutletName(baristaId),
      ])
    : [undefined, null];

  return (
    <ScanView
      user={{ name: session?.user?.name ?? "", email: session?.user?.email ?? "" }}
      stats={stats}
      outletName={outletName}
    />
  );
}
