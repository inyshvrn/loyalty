"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
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
import { updateCustomerAction } from "@/lib/actions/admin";

export function EditCustomerDialog({
  userId,
  name,
  email,
  phone,
}: {
  userId: string;
  name: string;
  email: string;
  phone: string | null;
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
    try {
      const result = await updateCustomerAction(null, formData);
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
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" type="button" />}
      >
        <Pencil className="size-3.5" />
        <span className="sr-only">Edit pelanggan</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Data Pelanggan</DialogTitle>
          <DialogDescription>
            Mengubah email tidak mereset status verifikasi — pastikan alamat
            barunya benar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <input type="hidden" name="userId" value={userId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-customer-name-${userId}`}>Nama</Label>
            <Input
              id={`edit-customer-name-${userId}`}
              name="name"
              defaultValue={name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-customer-email-${userId}`}>Email</Label>
            <Input
              id={`edit-customer-email-${userId}`}
              name="email"
              type="email"
              defaultValue={email}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-customer-phone-${userId}`}>Nomor HP</Label>
            <Input
              id={`edit-customer-phone-${userId}`}
              name="phone"
              defaultValue={phone ?? ""}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
