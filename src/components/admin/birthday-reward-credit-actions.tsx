"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import {
  cancelBirthdayRewardRedemptionAction,
  voidBirthdayRewardCreditAction,
} from "@/lib/actions/admin";
import type { ReferralCreditStatus } from "@/generated/prisma/client";

export function BirthdayRewardCreditActions({
  creditId,
  status,
}: {
  creditId: string;
  status: ReferralCreditStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (status === "CANCELLED") return null;

  const isRedeemed = status === "REDEEMED";

  async function handleConfirm() {
    setPending(true);
    try {
      const res = isRedeemed
        ? await cancelBirthdayRewardRedemptionAction(creditId)
        : await voidBirthdayRewardCreditAction(creditId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(isRedeemed ? "Pemakaian dibatalkan." : "Kredit dibatalkan permanen.");
      setOpen(false);
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="ghost" size="sm" type="button" />}>
        {isRedeemed ? "Batalkan Pemakaian" : "Batalkan Permanen"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isRedeemed
              ? "Batalkan pemakaian diskon ini?"
              : "Batalkan kredit diskon ini secara permanen?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isRedeemed
              ? "Gunakan kalau barista salah menerapkan diskon ini. Kredit akan tersedia lagi buat dipakai."
              : "Gunakan kalau reward ulang tahun ini ternyata tidak sah. Kredit ini tidak akan bisa dipakai lagi setelah dibatalkan."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={handleConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isRedeemed ? "Ya, Batalkan Pemakaian" : "Ya, Batalkan Permanen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
