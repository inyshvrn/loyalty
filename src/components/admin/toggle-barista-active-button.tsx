"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setBaristaActiveAction } from "@/lib/actions/admin";

export function ToggleBaristaActiveButton({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await setBaristaActiveAction(userId, !isActive);
      toast.success(
        isActive ? "Barista dinonaktifkan." : "Barista diaktifkan kembali."
      );
      router.refresh();
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
