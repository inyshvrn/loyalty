import { auth } from "@/lib/auth";
import { ScanView } from "@/components/barista/scan-view";

export default async function ScanPage() {
  const session = await auth();

  return (
    <ScanView
      user={{ name: session?.user?.name ?? "", email: session?.user?.email ?? "" }}
    />
  );
}
