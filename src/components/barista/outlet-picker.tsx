"use client";

import { useState } from "react";
import { unstable_rethrow } from "next/navigation";
import { toast } from "sonner";
import { Store, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { confirmBaristaOutletAction } from "@/lib/actions/barista";

export function OutletPicker({
  outlets,
  defaultOutletId,
}: {
  outlets: { id: string; name: string }[];
  defaultOutletId: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(defaultOutletId);
  const [pending, setPending] = useState(false);

  async function handleConfirm(outletId: string | null) {
    setPending(true);
    try {
      await confirmBaristaOutletAction(outletId);
    } catch (err) {
      // confirmBaristaOutletAction ends with redirect("/scan"), which Next
      // implements by throwing — let that specific throw through instead
      // of treating it as a real failure.
      unstable_rethrow(err);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setPending(false);
    }
  }

  if (outlets.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
          Belum ada outlet yang diatur admin. Kamu tetap bisa scan — nanti
          minta admin tambahin outlet lewat panel Admin &rarr; Outlet.
        </Card>
        <Button type="button" disabled={pending} onClick={() => handleConfirm(null)}>
          {pending ? "Memproses..." : "Lanjut ke Scan"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {outlets.map((outlet) => {
          const active = selected === outlet.id;
          return (
            <Card
              key={outlet.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(outlet.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected(outlet.id);
              }}
              className={cn(
                "flex-row items-center justify-between gap-3 p-4 transition-colors",
                active
                  ? "border-primary bg-secondary"
                  : "hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Store className="size-4" />
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {outlet.name}
                </p>
              </div>
              {active && <Check className="size-4 shrink-0 text-primary" />}
            </Card>
          );
        })}
      </div>
      <Button
        type="button"
        disabled={pending || !selected}
        onClick={() => handleConfirm(selected)}
      >
        {pending ? "Memproses..." : "Konfirmasi"}
      </Button>
    </div>
  );
}
