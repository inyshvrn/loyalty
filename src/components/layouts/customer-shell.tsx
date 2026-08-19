"use client";

import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";
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
    <div className="flex min-h-svh bg-background">
      <SidebarNav items={customerNav} subtitle="Pelanggan" user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
          <BrandMark />
          <UserMenu name={user.name} email={user.email} />
        </header>
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <BottomTabs items={customerNav} />
    </div>
  );
}
