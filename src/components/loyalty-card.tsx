import { QrCode, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BrandWatermark } from "@/components/brand-watermark";
import { cn } from "@/lib/utils";

const MAX_CIRCLES = 12;

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
  const useCircles = threshold > 0 && threshold <= MAX_CIRCLES;
  const progressPercent = threshold > 0 ? Math.min((stamps / threshold) * 100, 100) : 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 to-brand-600 p-5 text-primary-foreground shadow-warm-md",
        eligible && "ring-2 ring-reward ring-offset-2 ring-offset-background"
      )}
    >
      <BrandWatermark className="-right-12 -bottom-14 size-56 bg-white/14" />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex max-w-[70%] items-center truncate rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">
            {customerName}
          </span>
          {eligible && (
            <Badge className="shrink-0 border-transparent bg-reward text-reward-foreground">
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

        <div className="mb-3 flex justify-between text-[11px] opacity-90">
          <span>
            {stamps} dari {threshold} stempel
          </span>
          <span>{eligible ? "Tunjukkan ke barista" : `${remaining} lagi`}</span>
        </div>

        {useCircles ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: threshold }).map((_, i) => {
              const earned = i < stamps;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums",
                    earned
                      ? "border-white bg-white text-brand-700"
                      : "border-white/35 text-white/70"
                  )}
                >
                  {i + 1}
                </div>
              );
            })}
            <div
              className={cn(
                "flex aspect-square items-center justify-center rounded-full border",
                eligible
                  ? "border-reward bg-reward text-reward-foreground"
                  : "border-white/35 text-white/70"
              )}
            >
              <Gift className="size-4" strokeWidth={2} />
            </div>
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
    </div>
  );
}
