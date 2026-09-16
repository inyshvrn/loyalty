"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LockKeyholeOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetBaristaLockoutAction } from "@/lib/actions/admin";

export function ResetLockoutButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await resetBaristaLockoutAction(userId);
      toast.success("Kunci login dibuka. Barista bisa coba masuk lagi.");
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
      className="text-destructive hover:text-destructive"
    >
      <LockKeyholeOpen className="size-4" />
      Buka Kunci
    </Button>
  );
}
