"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/auth/form-message";
import { requestInitialStampGrantAction, type CustomerStatus } from "@/lib/actions/barista";

export function RequestInitialGrantDialog({
  customerId,
  customerName,
  onRequested,
}: {
  customerId: string;
  customerName: string;
  onRequested: (data: CustomerStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await requestInitialStampGrantAction(
        customerId,
        Number(formData.get("count")),
        String(formData.get("note") ?? "")
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      onRequested(res.data);
      toast.success("Ajuan dikirim — menunggu approval admin.");
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(undefined);
      }}
    >
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" className="h-11" />}>
        <Gift className="size-4" />
        Stempel Awal
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Stempel Awal</DialogTitle>
          <DialogDescription>
            Untuk {customerName} yang transfer dari kartu kertas lama. Cek
            dulu kartu fisiknya — jumlah ini baru aktif setelah admin
            menyetujui, bukan langsung sekarang.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="req-count">Jumlah stempel di kartu lama</Label>
            <Input
              id="req-count"
              name="count"
              type="number"
              min={2}
              max={200}
              defaultValue={2}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="req-note">Catatan (opsional)</Label>
            <Input id="req-note" name="note" maxLength={300} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Mengirim..." : "Ajukan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
