"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { adminGrantInitialStampsAction } from "@/lib/actions/admin";

export function GrantInitialStampsDialog({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await adminGrantInitialStampsAction(
        customerId,
        Number(formData.get("count")),
        String(formData.get("note") ?? "")
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      toast.success("Stempel awal diberikan.");
      setOpen(false);
      router.refresh();
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
      <DialogTrigger render={<Button type="button" size="sm" variant="outline" />}>
        <Gift className="size-4" />
        Stempel Awal (Kartu Lama)
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kasih Stempel Awal</DialogTitle>
          <DialogDescription>
            Untuk pelanggan yang transfer dari kartu kertas lama dan belum
            pernah dapat stempel di sini. Cek dulu kartu fisiknya — ini
            langsung aktif tanpa perlu approval lagi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grant-count">Jumlah stempel</Label>
            <Input
              id="grant-count"
              name="count"
              type="number"
              min={2}
              max={200}
              defaultValue={2}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="grant-note">Catatan (opsional)</Label>
            <Input id="grant-note" name="note" maxLength={300} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Beri Stempel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
