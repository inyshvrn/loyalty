"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setAdminActiveAction } from "@/lib/actions/admin";

export function ToggleAdminActiveButton({
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
      await setAdminActiveAction(userId, !isActive);
      toast.success(
        isActive ? "Admin dinonaktifkan." : "Admin diaktifkan kembali."
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
