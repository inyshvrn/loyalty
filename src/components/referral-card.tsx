"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ReferralCard({
  code,
  referralCount,
  availableCredits,
}: {
  code: string | null;
  referralCount: number;
  availableCredits: number;
}) {
  const [copying, setCopying] = useState(false);

  async function handleCopy() {
    if (!code) return;
    setCopying(true);
    try {
      const link = `${window.location.origin}/register?ref=${code}`;
      await navigator.clipboard.writeText(link);
      toast.success("Link referral disalin.");
    } catch {
      toast.error("Gagal menyalin link. Coba lagi.");
    } finally {
      setCopying(false);
    }
  }

  if (!code) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Ajak Teman</h2>
      <Card className="p-4">
        <p className="text-xs text-muted-foreground">Kode referral kamu</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="font-mono text-lg font-bold tracking-wider text-foreground">
            {code}
          </span>
          <Button size="sm" variant="outline" type="button" onClick={handleCopy} disabled={copying}>
            <Copy className="size-3.5" />
            Salin Link
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div>
            <p className="font-mono text-xl font-bold tabular-nums text-foreground">
              {referralCount}
            </p>
            <p className="text-xs text-muted-foreground">Teman diundang</p>
          </div>
          <div>
            <p className="font-mono text-xl font-bold tabular-nums text-foreground">
              {availableCredits}
            </p>
            <p className="text-xs text-muted-foreground">Diskon tersedia</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
