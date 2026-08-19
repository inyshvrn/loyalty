import { BaristaShell } from "@/components/layouts/barista-shell";

export default function BaristaLayout({ children }: { children: React.ReactNode }) {
  return <BaristaShell>{children}</BaristaShell>;
}
