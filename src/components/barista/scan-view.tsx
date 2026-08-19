"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Camera, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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

  function updateStatusEverywhere(data: CustomerStatus) {
    setResults((prev) => prev.map((r) => (r.id === data.id ? data : r)));
    setScanResult((prev) => (prev && prev.id === data.id ? data : prev));
  }

  async function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    try {
      const res = await searchCustomersAction(q);
      setResults(res);
      setSearched(true);
    } catch {
      toast.error("Gagal mencari pelanggan. Coba lagi.");
    } finally {
      setSearching(false);
    }
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
    if (busyId) return; // ignore repeat decodes while a request is in flight
    setBusyId(customerId);
    try {
      const res = await addStampAction(customerId);
      if (!res.ok) {
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
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Scan Pelanggan</h1>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "scan" | "manual")}
        className="flex-1"
      >
        <TabsList className="w-full">
          <TabsTrigger value="scan">
            <Camera className="size-4" />
            Scan QR
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Search className="size-4" />
            Cari Manual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4 flex flex-col gap-3">
          {tab === "scan" && <QrScanner onDecode={handleDecode} />}
          {scanResult && (
            <CustomerStatusCard
              status={scanResult}
              busy={busyId === scanResult.id}
              onAddStamp={() => handleAddStamp(scanResult.id)}
              onConfirmReward={() => handleConfirmReward(scanResult.id)}
            />
          )}
        </TabsContent>

        <TabsContent value="manual" className="mt-4 flex flex-col gap-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, email, atau nomor HP"
              className="pl-8"
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
                Tidak ada pelanggan yang cocok.
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
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
