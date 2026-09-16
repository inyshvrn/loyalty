"use client";

import { BrandMark } from "@/components/brand-mark";
import { SidebarNav } from "@/components/layouts/sidebar-nav";
import { BottomTabs } from "@/components/layouts/bottom-tabs";
import { customerNav } from "@/lib/nav-config";

export function CustomerShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <SidebarNav items={customerNav} subtitle="Pelanggan" user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Logout lives in the bottom nav's "Akun" tab on mobile now, so this
         * header is brand-only there — no need for a second access point. */}
        <header className="flex items-center border-b border-border px-4 py-3 md:hidden">
          <BrandMark />
        </header>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">{children}</main>
      </div>
      <BottomTabs items={customerNav} user={user} />
    </div>
  );
}
