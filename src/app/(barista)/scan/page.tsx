import { ScanQrView } from "@/components/barista/scan-qr-view";
import { ScanSubNav } from "@/components/barista/scan-subnav";

export default function ScanPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Scan Pelanggan</h1>
      <ScanSubNav active="scan" />
      <ScanQrView />
    </div>
  );
}
