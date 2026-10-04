"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setCustomerActiveAction } from "@/lib/actions/admin";

export function ToggleCustomerActiveButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await setCustomerActiveAction(userId, !isActive);
      toast.success(
        isActive ? "Pelanggan dinonaktifkan." : "Pelanggan diaktifkan kembali."
      );
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      disabled={pending}
      onClick={handleClick}
    >
      {isActive ? "Nonaktifkan" : "Aktifkan"}
    </Button>
  );
}
