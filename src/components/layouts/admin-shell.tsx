"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";
import { SidebarNav } from "@/components/layouts/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { adminNav, type NavItem } from "@/lib/nav-config";

function DrawerNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <SheetClose
            key={item.href}
            nativeButton={false}
            render={<Link href={item.href} />}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
              active &&
                "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="size-4" strokeWidth={2} />
            {item.label}
            {!!item.badge && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {item.badge}
              </span>
            )}
          </SheetClose>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  user,
  pendingStampRequests,
  children,
}: {
  user: { name: string; email: string };
  pendingStampRequests?: number;
  children: React.ReactNode;
}) {
  const items: NavItem[] = adminNav.map((item) =>
    item.href === "/admin/stamp-requests" && pendingStampRequests
      ? { ...item, badge: pendingStampRequests }
      : item
  );

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <SidebarNav items={items} subtitle="Admin" user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:hidden">
          <BrandMark />
          <div className="flex items-center gap-2">
            <UserMenu name={user.name} email={user.email} />
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="size-5" />
                <span className="sr-only">Buka menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <BrandMark />
                  <SheetTitle className="sr-only">Menu navigasi admin</SheetTitle>
                </SheetHeader>
                <DrawerNav items={items} />
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
