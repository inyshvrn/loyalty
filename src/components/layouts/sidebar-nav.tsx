"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/nav-config";

export function SidebarNav({
  items,
  subtitle,
  user,
}: {
  items: NavItem[];
  subtitle: string;
  user?: { name: string; email: string };
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-6 md:flex">
      <div className="mb-1 px-2">
        <BrandMark />
        <p className="mt-1 pl-9.5 text-[11px] font-medium text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <nav className="mt-6 flex flex-col gap-0.5">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                active &&
                  "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="mt-auto border-t border-border px-2 pt-3">
          <UserMenu name={user.name} email={user.email} />
        </div>
      )}
    </aside>
  );
}
