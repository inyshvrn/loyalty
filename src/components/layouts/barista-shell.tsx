import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";

export function BaristaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6">
        <BrandMark />
        <Badge variant="secondary" className="font-semibold">
          Barista
        </Badge>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
