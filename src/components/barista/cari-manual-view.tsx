"use client";

import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CustomerStatusCard } from "@/components/barista/customer-status-card";
import { useCustomerActions } from "@/lib/hooks/use-customer-actions";
import { searchCustomersAction, type CustomerStatus } from "@/lib/actions/barista";

export function CariManualView({ initialResults }: { initialResults: CustomerStatus[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerStatus[]>(initialResults);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(true);

  const { busyId, handleAddStamp, handleConfirmReward } = useCustomerActions((data) => {
    setResults((prev) => prev.map((r) => (r.id === data.id ? data : r)));
  });

  // A barista can start typing before the initial full-list request
  // resolves — without this guard, whichever response happens to come back
  // last (not necessarily the most recently fired) would win and could
  // stomp a more relevant result with a stale one.
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

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    runSearch(query.trim());
  }

  return (
    <div className="flex flex-col gap-3">
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
              onGrantRequested={(data) =>
                setResults((prev) => prev.map((r) => (r.id === data.id ? data : r)))
              }
            />
          ))}
      </div>
    </div>
  );
}
