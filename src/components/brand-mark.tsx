import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  hideLabel = false,
  className,
}: {
  hideLabel?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logo-icon.png"
        alt=""
        width={465}
        height={465}
        className="size-8 shrink-0"
        priority
      />
      {!hideLabel && (
        <span className="text-sm font-bold tracking-tight text-foreground">
          Handai Coffee
        </span>
      )}
    </div>
  );
}
