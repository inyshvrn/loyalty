"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LockKeyholeOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetAdminLockoutAction } from "@/lib/actions/admin";

export function ResetAdminLockoutButton({ userId }: { userId: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      await resetAdminLockoutAction(userId);
      toast.success("Kunci login dibuka. Admin bisa coba masuk lagi.");
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
