import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({
  hideLabel = false,
  className,
}: {
  hideLabel?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary">
        <Leaf className="size-4 text-primary-foreground" strokeWidth={2} />
      </span>
      {!hideLabel && (
        <span className="text-sm font-bold tracking-tight text-foreground">
          Handai Coffee
        </span>
      )}
    </div>
  );
}
