"use client";

import { useState } from "react";
import { Percent } from "lucide-react";
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
import { getOldestAvailableCredit, type OldestAvailableCredit } from "@/lib/actions/barista";
import { formatDiscountAmount } from "@/lib/format";

export function RedeemReferralCreditDialog({
  customerId,
  customerName,
  busy,
  onRedeem,
}: {
  customerId: string;
  customerName: string;
  busy: boolean;
  onRedeem: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credit, setCredit] = useState<OldestAvailableCredit>(null);

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setCredit(null);
      return;
    }
    setLoading(true);
    try {
      setCredit(await getOldestAvailableCredit(customerId));
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
            variant="outline"
            disabled={busy}
            className="h-11 w-full"
          />
        }
      >
        <Percent className="size-4" />
        Pakai Diskon Referral
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terapkan diskon untuk {customerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {loading
              ? "Memuat diskon..."
              : credit
                ? `Diskon ${formatDiscountAmount(credit.discountType, credit.discountValue)} dari referral — bakal langsung dipakai buat transaksi ini.`
                : "Pelanggan ini tidak punya diskon referral yang tersedia."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy || loading || !credit}
            onClick={() => {
              setOpen(false);
              onRedeem();
            }}
          >
            {busy ? "Memproses..." : "Terapkan Diskon"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
