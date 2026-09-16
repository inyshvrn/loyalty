"use client";

import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { QrScanner } from "@/components/barista/qr-scanner";
import { CustomerStatusCard } from "@/components/barista/customer-status-card";
import {
  searchCustomersAction,
  addStampAction,
  confirmRewardAction,
  type CustomerStatus,
} from "@/lib/actions/barista";

const navTabClass =
  "group flex h-auto flex-1 flex-col items-center gap-1 rounded-none border-none bg-transparent px-1 py-2.5 text-[11px] font-semibold text-muted-foreground shadow-none transition-colors data-active:bg-transparent data-active:text-primary data-active:shadow-none md:h-7 md:flex-initial md:flex-row md:gap-1.5 md:rounded-md md:bg-transparent md:px-3 md:py-0.5 md:text-sm md:text-foreground/60 md:data-active:bg-background md:data-active:text-foreground";

const navIconWrapClass =
  "flex size-8 items-center justify-center rounded-full transition-colors group-data-active:bg-primary/15 md:hidden";

export function ScanView({ user }: { user: { name: string; email: string } }) {
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

        {/* Fixed to the bottom on mobile, styled to match BottomTabs (icon
         * over label, same active-state pill) so it reads as the app's nav
         * rather than a tab strip that got shoved to the edge of the
         * screen — with an "Akun" slot alongside so logging out doesn't
         * need a trip to the header menu. A normal in-flow tab strip above
         * the content on desktop, where thumb reach isn't a concern and the
         * header's account menu is already easy to reach. */}
        <div className="fixed inset-x-0 bottom-0 z-20 flex border-t border-border bg-card/95 pb-[max(env(safe-area-inset-bottom),10px)] backdrop-blur-sm md:static md:order-first md:mb-4 md:w-fit md:justify-center md:border-none md:bg-muted md:p-[3px] md:pb-[3px] md:backdrop-blur-none">
          <TabsList className="contents">
            <TabsTrigger value="scan" className={navTabClass}>
              <span className={navIconWrapClass}>
                <Camera className="size-5" strokeWidth={2} />
              </span>
              <Camera className="hidden size-4 md:block" />
              Scan QR
            </TabsTrigger>
            <TabsTrigger value="manual" className={navTabClass}>
              <span className={navIconWrapClass}>
                <Search className="size-5" strokeWidth={2} />
              </span>
              <Search className="hidden size-4 md:block" />
              Cari Manual
            </TabsTrigger>
          </TabsList>
          <div className="flex flex-1 md:hidden">
            <UserMenu name={user.name} email={user.email} variant="nav" />
          </div>
        </div>
      </Tabs>
    </div>
  );
}
