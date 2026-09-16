"use client";

import Link from "next/link";
import { Camera, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/scan", label: "Scan QR", icon: Camera, key: "scan" },
  { href: "/scan/cari", label: "Cari Manual", icon: Search, key: "cari" },
] as const;

// Desktop-only switcher between Scan QR and Cari Manual — mobile relies on
// the persistent bottom nav instead, which already covers these two plus
// Akun.
export function ScanSubNav({ active }: { active: "scan" | "cari" }) {
  return (
    <div className="mb-4 hidden w-fit gap-[3px] rounded-md bg-muted p-[3px] md:flex">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === active;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 rounded-sm px-3 py-0.5 text-sm font-medium text-foreground/60 transition-colors",
              isActive && "bg-background text-foreground shadow-sm"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
