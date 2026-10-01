"use client";

import { useState } from "react";
import { Cake } from "lucide-react";
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
import { getBirthdayRewardPreview, type BirthdayRewardPreview } from "@/lib/actions/barista";
import { formatDiscountAmount } from "@/lib/format";

export function RedeemBirthdayRewardDialog({
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
  const [preview, setPreview] = useState<BirthdayRewardPreview>(null);

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPreview(null);
      return;
    }
    setLoading(true);
    try {
      setPreview(await getBirthdayRewardPreview(customerId));
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
        <Cake className="size-4" />
        Pakai Diskon Ultah
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terapkan diskon ulang tahun untuk {customerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            {loading
              ? "Memuat diskon..."
              : preview
                ? `Diskon ${formatDiscountAmount(preview.discountType, preview.discountValue)} ulang tahun — bakal langsung dipakai buat transaksi ini.`
                : "Pelanggan ini tidak punya reward ulang tahun yang tersedia."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy || loading || !preview}
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
