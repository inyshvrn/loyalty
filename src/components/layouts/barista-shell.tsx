"use client";

import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";
import { BottomTabs } from "@/components/layouts/bottom-tabs";
import { baristaNav } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

export function BaristaShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // The outlet-picker gate isn't part of the Scan/Cari/Akun rotation — hide
  // the nav there so it doesn't invite navigating away from an unconfirmed
  // outlet (the proxy would just bounce back anyway).
  const showBottomNav = pathname !== "/scan/pilih-outlet";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <BrandMark />
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-semibold">
            Barista
          </Badge>
          <UserMenu name={user.name} email={user.email} isBarista />
        </div>
      </header>
      <main className={cn("flex flex-1 flex-col", showBottomNav && "pb-20 md:pb-0")}>
        {children}
      </main>
      {showBottomNav && <BottomTabs items={baristaNav} exact />}
    </div>
  );
}
