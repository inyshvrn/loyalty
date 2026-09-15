"use client";

import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/barista/qr-scanner";
import { CustomerStatusCard } from "@/components/barista/customer-status-card";
import {
  searchCustomersAction,
  addStampAction,
  confirmRewardAction,
  type CustomerStatus,
} from "@/lib/actions/barista";

export function ScanView() {
  const [tab, setTab] = useState<"scan" | "manual">("scan");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerStatus[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<CustomerStatus | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  function resetScan() {
    setScanResult(null);
    setScanError(null);
    setScanning(true);
  }

  function updateStatusEverywhere(data: CustomerStatus) {
    setResults((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    setScanResult((prev) => (prev && prev.id === data.id ? data : prev));
  }

  // Opening the manual tab auto-loads the full list, and a barista can
  // start typing before that resolves — without this guard, whichever
  // request happens to come back last (not necessarily the most recent one
  // fired) would win and could stomp a more relevant result with a stale one.
  const searchSeq = useRef(0);

  async function runSearch(q: string) {
    const seq = ++searchSeq.current;
    setSearching(true);
    try {
      const res = await searchCustomersAction(q);
      if (seq !== searchSeq.current) return;
      setResults(res);
      setSearched(true);
    } catch {
      if (seq === searchSeq.current) toast.error("Gagal mencari pelanggan. Coba lagi.");
    } finally {
      if (seq === searchSeq.current) setSearching(false);
    }
  }

  // Switching to the manual tab shows every customer A-Z right away — a
  // browsable directory, not just a blank box waiting for a query.
  function handleTabChange(value: string) {
    const next = value as "scan" | "manual";
    setTab(next);
    if (next === "manual" && !searched) {
      runSearch("");
    }
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query.trim());
  }

  async function handleAddStamp(customerId: string) {
    setBusyId(customerId);
    try {
      const res = await addStampAction(customerId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      updateStatusEverywhere(res.data);
      if (res.stampAdded) {
        toast.success("Stempel ditambahkan", {
          description: `${res.data.name} · ${res.data.stamps}/${res.data.threshold}`,
        });
      } else {
        toast.info(res.reason, { description: res.data.name });
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmReward(customerId: string) {
    setBusyId(customerId);
    try {
      const res = await confirmRewardAction(customerId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      updateStatusEverywhere(res.data);
      toast.success("Reward dikonfirmasi", {
        description: `${res.data.name} — stempel direset`,
      });
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDecode(customerId: string) {
    if (!scanning || busyId) return; // one decode per scan session
    setScanning(false); // stop the camera immediately so it can't re-fire on the same QR
    setBusyId(customerId);
    try {
      const res = await addStampAction(customerId);
      if (!res.ok) {
        setScanError(res.error);
        toast.error(res.error);
        return;
      }
      setScanResult(res.data);
      if (res.stampAdded) {
        toast.success("Stempel ditambahkan", {
          description: `${res.data.name} · ${res.data.stamps}/${res.data.threshold}`,
        });
      } else {
        toast.info(res.reason, { description: res.data.name });
      }
    } catch {
      setScanError("Terjadi kesalahan. Coba lagi.");
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-6 pb-28 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Scan Pelanggan</h1>

      <Tabs
        value={tab}
        onValueChange={handleTabChange}
        className="flex-1"
      >
        <TabsContent value="scan" className="flex flex-col gap-3">
          {tab === "scan" && scanning && <QrScanner onDecode={handleDecode} />}
          {!scanning && (
            <>
              {scanResult && (
                <CustomerStatusCard
                  status={scanResult}
                  busy={busyId === scanResult.id}
                  onAddStamp={() => handleAddStamp(scanResult.id)}
                  onConfirmReward={() => handleConfirmReward(scanResult.id)}
                  onGrantRequested={updateStatusEverywhere}
                />
              )}
              {scanError && (
                <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {scanError}
                </p>
              )}
              <Button
                className="h-11"
                type="button"
                variant="outline"
                onClick={resetScan}
              >
                Scan Lagi
              </Button>
            </>
          )}
        </TabsContent>

        <TabsContent value="manual" className="flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, email, atau nomor HP"
              className="h-11 pl-9 text-base"
            />
          </form>
          <div className="flex flex-col gap-2">
            {searching && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Mencari...
              </p>
            )}
            {!searching && searched && results.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {query.trim()
                  ? "Tidak ada pelanggan yang cocok."
                  : "Belum ada pelanggan terdaftar."}
              </p>
            )}
            {!searching &&
              results.map((result) => (
                <CustomerStatusCard
                  key={result.id}
                  status={result}
                  busy={busyId === result.id}
                  onAddStamp={() => handleAddStamp(result.id)}
                  onConfirmReward={() => handleConfirmReward(result.id)}
                  onGrantRequested={updateStatusEverywhere}
                />
              ))}
          </div>
        </TabsContent>

        {/* Fixed to the bottom on mobile — within thumb reach — instead of
         * sitting at the top of a tall screen; a normal in-flow tab strip
         * above the content on desktop, where reach isn't a concern. */}
        <TabsList className="fixed inset-x-0 bottom-0 z-20 h-auto w-full max-w-none justify-stretch gap-2 rounded-none border-t border-border bg-card/95 p-2 pb-[max(env(safe-area-inset-bottom),8px)] backdrop-blur-sm md:static md:order-first md:mb-4 md:w-fit md:max-w-full md:justify-center md:gap-0 md:rounded-lg md:border-none md:bg-muted md:p-[3px] md:pb-[3px] md:backdrop-blur-none">
          <TabsTrigger value="scan" className="h-11 flex-1 text-base md:h-7 md:flex-initial md:text-sm">
            <Camera className="size-4" />
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="manual" className="h-11 flex-1 text-base md:h-7 md:flex-initial md:text-sm">
            <Search className="size-4" />
            Cari Manual
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
