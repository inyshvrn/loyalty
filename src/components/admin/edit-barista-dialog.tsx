"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { updateBaristaAction } from "@/lib/actions/admin";

const NO_OUTLET = "__none__";

export function EditBaristaDialog({
  userId,
  name,
  email,
  outletId,
  outlets,
}: {
  userId: string;
  name: string;
  email: string;
  outletId: string | null;
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
      const result = await updateBaristaAction(null, formData);
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
        <span className="sr-only">Edit barista</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Akun Barista</DialogTitle>
          <DialogDescription>
            Kosongkan kata sandi kalau tidak ingin menggantinya.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormMessage error={error} />
          <input type="hidden" name="userId" value={userId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-barista-name-${userId}`}>Nama</Label>
            <Input
              id={`edit-barista-name-${userId}`}
              name="name"
              defaultValue={name}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-barista-email-${userId}`}>Email</Label>
            <Input
              id={`edit-barista-email-${userId}`}
              name="email"
              type="email"
              defaultValue={email}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-barista-password-${userId}`}>
              Kata sandi baru (opsional)
            </Label>
            <Input
              id={`edit-barista-password-${userId}`}
              name="password"
              type="password"
              minLength={8}
              placeholder="Kosongkan jika tidak diubah"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-barista-outlet-${userId}`}>Outlet</Label>
            <Select name="outletId" defaultValue={outletId ?? NO_OUTLET}>
              <SelectTrigger id={`edit-barista-outlet-${userId}`} className="w-full">
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
              {pending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
