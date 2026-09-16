import { searchCustomersAction } from "@/lib/actions/barista";
import { CariManualView } from "@/components/barista/cari-manual-view";
import { ScanSubNav } from "@/components/barista/scan-subnav";

export default async function CariManualPage() {
  // Fetched here instead of client-side so the A-Z directory is there on
  // first paint, not after a loading flash.
  const initialResults = await searchCustomersAction("");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Cari Pelanggan</h1>
      <ScanSubNav active="cari" />
      <CariManualView initialResults={initialResults} />
    </div>
  );
}
