import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LoyaltyCard({
  customerName,
  stamps,
  threshold,
}: {
  customerName: string;
  stamps: number;
  threshold: number;
}) {
  const eligible = stamps >= threshold;
  const remaining = Math.max(threshold - stamps, 0);

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-br from-brand-700 to-brand-600 p-5 text-primary-foreground shadow-warm-md",
        eligible && "ring-2 ring-reward ring-offset-2 ring-offset-background"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs opacity-80">Kartu Loyalitas</p>
          <p className="text-sm font-semibold">{customerName}</p>
        </div>
        {eligible && (
          <Badge className="border-transparent bg-reward text-reward-foreground">
            Siap Diklaim
          </Badge>
        )}
      </div>

      <div className="mx-auto my-5 flex size-32 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/30 bg-white/10">
        <QrCode className="size-8 opacity-80" strokeWidth={1.5} />
        <span className="text-[10px] opacity-70">QR Anda</span>
      </div>

      <div className="mb-1.5 flex justify-between text-[11px] opacity-90">
        <span>
          {stamps} dari {threshold} stempel
        </span>
        <span>{eligible ? "Tunjukkan ke barista" : `${remaining} lagi`}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: threshold }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full bg-white/25",
              i < stamps && (eligible ? "bg-reward-border" : "bg-white")
            )}
          />
        ))}
      </div>
    </div>
  );
}
