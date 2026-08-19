import { QrCode } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAX_DOTS = 12;

export function LoyaltyCard({
  customerName,
  stamps,
  threshold,
  qrDataUrl,
}: {
  customerName: string;
  stamps: number;
  threshold: number;
  qrDataUrl?: string | null;
}) {
  const eligible = stamps >= threshold;
  const remaining = Math.max(threshold - stamps, 0);
  const useDots = threshold > 0 && threshold <= MAX_DOTS;
  const progressPercent = threshold > 0 ? Math.min((stamps / threshold) * 100, 100) : 0;

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

      <div className="mx-auto my-5 flex size-32 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-2">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- inline data: URI generated per-request; next/image's optimizer doesn't apply here
          <img
            src={qrDataUrl}
            alt="QR Anda"
            width={112}
            height={112}
            className="size-full rounded-md bg-white p-1.5"
          />
        ) : (
          <>
            <QrCode className="size-8 opacity-80" strokeWidth={1.5} />
            <span className="text-[10px] opacity-70">QR Anda</span>
          </>
        )}
      </div>

      <div className="mb-1.5 flex justify-between text-[11px] opacity-90">
        <span>
          {stamps} dari {threshold} stempel
        </span>
        <span>{eligible ? "Tunjukkan ke barista" : `${remaining} lagi`}</span>
      </div>
      {useDots ? (
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
      ) : (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className={cn(
              "h-full rounded-full",
              eligible ? "bg-reward-border" : "bg-white"
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}
