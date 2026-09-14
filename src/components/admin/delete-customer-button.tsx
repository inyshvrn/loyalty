"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
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
import { deleteCustomerAction } from "@/lib/actions/admin";

export function DeleteCustomerButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      const res = await deleteCustomerAction(userId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`Akun ${name} dihapus.`);
      setOpen(false);
      router.push("/admin/customers");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" type="button" />}
      >
        <Trash2 className="size-3.5 text-destructive" />
        <span className="sr-only">Hapus pelanggan</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus akun {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Hanya bisa dihapus kalau belum pernah dapat stempel atau klaim
            reward apa pun — cocok untuk membersihkan akun duplikat/salah
            ketik yang belum pernah dipakai. Tindakan ini tidak bisa
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={handleConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
