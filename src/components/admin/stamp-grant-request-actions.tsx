"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
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
  approveStampGrantRequestAction,
  cancelStampGrantRequestAction,
} from "@/lib/actions/admin";

export function StampGrantRequestActions({
  requestId,
  customerName,
  count,
}: {
  requestId: string;
  customerName: string;
  count: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"approve" | "cancel" | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  async function handleApprove() {
    setPending("approve");
    try {
      const res = await approveStampGrantRequestAction(requestId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Ajuan ${count} stempel untuk ${customerName} dikonfirmasi.`);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(null);
    }
  }

  async function handleCancel() {
    setPending("cancel");
    try {
      const res = await cancelStampGrantRequestAction(requestId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Ajuan dibatalkan, stempel dihapus.");
      setCancelOpen(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex shrink-0 gap-2">
      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogTrigger
          render={<Button size="sm" variant="outline" type="button" disabled={pending !== null} />}
        >
          <X className="size-4" />
          Batalkan
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan {count} stempel untuk {customerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Stempel yang sudah diberikan bakal dihapus. Gunakan kalau kartu
              fisiknya ternyata tidak valid atau jumlahnya tidak cocok.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending !== null}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending !== null}
              onClick={handleCancel}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Batalkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Button size="sm" type="button" disabled={pending !== null} onClick={handleApprove}>
        <Check className="size-4" />
        {pending === "approve" ? "Menyetujui..." : "Setujui"}
      </Button>
    </div>
  );
}
