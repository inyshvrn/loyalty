import { cn } from "@/lib/utils";

/**
 * Oversized, tinted brand-mark watermark for decorative use behind card or
 * section content. Color comes from a `bg-*` utility in `className` (the
 * mask paints that color through the icon's shape); position/size are also
 * caller-controlled since the right crop/scale differs per surface.
 */
export function BrandWatermark({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "brand-watermark pointer-events-none absolute",
        className
      )}
    />
  );
}
