"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { createBaristaAction } from "@/lib/actions/admin";

const NO_OUTLET = "__none__";

export function CreateBaristaDialog({
  outlets,
}: {
  outlets: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    if (formData.get("outletId") === NO_OUTLET) formData.set("outletId", "");
    try {
      const result = await createBaristaAction(null, formData);
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
      <DialogTrigger render={<Button type="button" size="sm" />}>
        <UserPlus className="size-4" />
        Tambah Barista
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Akun Barista</DialogTitle>
          <DialogDescription>
            Akun langsung aktif dan terverifikasi — barista tidak perlu
            verifikasi email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="barista-name">Nama</Label>
            <Input id="barista-name" name="name" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="barista-email">Email</Label>
            <Input id="barista-email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="barista-password">Kata sandi awal</Label>
            <PasswordInput
              id="barista-password"
              name="password"
              minLength={8}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="barista-outlet">Outlet</Label>
            <Select name="outletId" defaultValue={NO_OUTLET}>
              <SelectTrigger id="barista-outlet" className="w-full">
                <SelectValue placeholder="Tanpa outlet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_OUTLET}>Tanpa outlet</SelectItem>
                {outlets.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Buat Akun"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
