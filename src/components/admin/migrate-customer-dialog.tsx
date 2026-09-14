"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
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
import { migrateCustomerAction } from "@/lib/actions/admin";

export function MigrateCustomerDialog() {
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
      const result = await migrateCustomerAction(null, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
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
        <UserPlus className="size-4" />
        Daftarkan Pelanggan Lama
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Daftarkan Pelanggan Lama</DialogTitle>
          <DialogDescription>
            Buat akun berikut progres awal buat pelanggan yang pindah dari
            kartu kertas — akun langsung aktif dan terverifikasi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="migrate-name">Nama</Label>
            <Input id="migrate-name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="migrate-email">Email</Label>
            <Input id="migrate-email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="migrate-phone">Nomor HP</Label>
            <Input
              id="migrate-phone"
              name="phone"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="migrate-password">Kata sandi awal</Label>
            <Input
              id="migrate-password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="migrate-stamps">
              Jumlah stempel awal (dari kartu kertas)
            </Label>
            <Input
              id="migrate-stamps"
              name="initialStamps"
              type="number"
              min={0}
              max={999}
              defaultValue={0}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Daftarkan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
