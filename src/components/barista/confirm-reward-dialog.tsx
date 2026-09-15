"use client";

import { useState } from "react";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { formatRelativeIndonesian } from "@/lib/format";
import { getClaimHistorySummary, type ClaimHistorySummary } from "@/lib/actions/barista";

export function ConfirmRewardDialog({
  customerId,
  customerName,
  busy,
  onConfirm,
}: {
  customerId: string;
  customerName: string;
  busy: boolean;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ClaimHistorySummary | null>(null);

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setHistory(null);
      return;
    }
    setLoading(true);
    try {
      setHistory(await getClaimHistorySummary(customerId));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger
        render={
          <Button
            size="sm"
            type="button"
            disabled={busy}
            className="h-11 w-full bg-reward text-reward-foreground hover:bg-reward/90"
          />
        }
      >
        <Gift className="size-4" />
        Konfirmasi Reward
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Konfirmasi reward untuk {customerName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {loading
              ? "Memuat riwayat klaim..."
              : history
                ? history.totalClaims > 0
                  ? `Sudah klaim reward ${history.totalClaims}x sebelumnya — terakhir ${formatRelativeIndonesian(history.lastClaimAt!).toLowerCase()}. `
                  : "Belum pernah klaim reward sebelumnya. "
                : ""}
            Stempelnya bakal direset setelah ini dikonfirmasi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy || loading}
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
            className="bg-reward text-reward-foreground hover:bg-reward/90"
          >
            {busy ? "Memproses..." : "Konfirmasi"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
