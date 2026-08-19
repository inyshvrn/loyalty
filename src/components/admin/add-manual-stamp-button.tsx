"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addManualStampAction } from "@/lib/actions/admin";

export function AddManualStampButton({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await addManualStampAction(customerId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Stempel manual ditambahkan.");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={handleClick}
    >
      <Plus className="size-4" />
      Tambah Stempel Manual
    </Button>
  );
}
