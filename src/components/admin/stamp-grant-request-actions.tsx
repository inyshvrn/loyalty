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
  rejectStampGrantRequestAction,
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
  const [pending, setPending] = useState<"approve" | "reject" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  async function handleApprove() {
    setPending("approve");
    try {
      const res = await approveStampGrantRequestAction(requestId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${count} stempel disetujui untuk ${customerName}.`);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(null);
    }
  }

  async function handleReject() {
    setPending("reject");
    try {
      const res = await rejectStampGrantRequestAction(requestId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Ajuan ditolak.");
      setRejectOpen(false);
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex shrink-0 gap-2">
      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogTrigger
          render={<Button size="sm" variant="outline" type="button" disabled={pending !== null} />}
        >
          <X className="size-4" />
          Tolak
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak {count} stempel untuk {customerName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Tidak ada stempel yang dibuat. Gunakan kalau kartu fisiknya
              ternyata tidak valid atau jumlahnya tidak cocok.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending !== null}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending !== null}
              onClick={handleReject}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Tolak
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
