"use client";

import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
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
import { updateAdminAction } from "@/lib/actions/admin";

export function EditAdminDialog({
  userId,
  name,
  email,
}: {
  userId: string;
  name: string;
  email: string;
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
      const result = await updateAdminAction(null, formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
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
      <DialogTrigger
        render={<Button variant="ghost" size="icon-sm" type="button" />}
      >
        <Pencil className="size-3.5" />
        <span className="sr-only">Edit admin</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Akun Admin</DialogTitle>
          <DialogDescription>
            Kosongkan kata sandi kalau tidak ingin menggantinya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <input type="hidden" name="userId" value={userId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-admin-name-${userId}`}>Nama</Label>
            <Input
              id={`edit-admin-name-${userId}`}
              name="name"
              defaultValue={name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-admin-email-${userId}`}>Email</Label>
            <Input
              id={`edit-admin-email-${userId}`}
              name="email"
              type="email"
              defaultValue={email}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-admin-password-${userId}`}>
              Kata sandi baru (opsional)
            </Label>
            <PasswordInput
              id={`edit-admin-password-${userId}`}
              name="password"
              minLength={8}
              placeholder="Kosongkan jika tidak diubah"
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
