"use client";

import Link from "next/link";
import { LogOut, CircleUserRound, Store, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function UserMenu({
  name,
  email,
  variant = "avatar",
  stats,
  outletName,
}: {
  name: string;
  email: string;
  /** "nav" matches the icon-over-label look of BottomTabs, for use as a
   * bottom-nav "Akun" slot instead of the small avatar icon. */
  variant?: "avatar" | "nav";
  /** Barista-only — shown as a couple of stat tiles above "Keluar" when
   * present. Omitted entirely for customer/admin menus. */
  stats?: {
    totalStamps: number;
    totalClaims: number;
    stampsThisMonth: number;
    claimsThisMonth: number;
  };
  /** Barista-only — their currently assigned outlet (null if none set yet).
   * Passing this at all (even null) shows a "ganti outlet" row that jumps
   * to /scan/pilih-outlet — reachable anytime, not just once per login, so
   * a barista covering a second outlet mid-shift doesn't need to log out
   * and back in just to switch. */
  outletName?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "outline-none",
          variant === "nav"
            ? "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground"
            : "flex size-11 items-center justify-center gap-2 rounded-lg hover:bg-secondary focus-visible:bg-secondary"
        )}
      >
        {variant === "nav" ? (
          <>
            <span className="flex size-8 items-center justify-center rounded-full transition-colors">
              <CircleUserRound className="size-5" strokeWidth={2} />
            </span>
            Akun
          </>
        ) : (
          <>
            <Avatar>
              <AvatarFallback>{initials(name)}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Menu akun</span>
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {stats && (
          <>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-2 gap-2 px-1.5 py-2">
              <div className="rounded-lg bg-secondary px-2.5 py-2">
                <p className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {stats.totalStamps}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Stempel diberikan
                </p>
              </div>
              <div className="rounded-lg bg-secondary px-2.5 py-2">
                <p className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {stats.totalClaims}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Reward dikonfirmasi
                </p>
              </div>
            </div>
            <p className="px-2.5 pb-1.5 text-[11px] text-muted-foreground">
              Bulan ini: {stats.stampsThisMonth} stempel &middot;{" "}
              {stats.claimsThisMonth} reward
            </p>
          </>
        )}
        {outletName !== undefined && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              nativeButton
              className="min-h-11 gap-2.5 py-2.5 text-base"
              render={<Link href="/scan/pilih-outlet" />}
            >
              <Store className="size-4" />
              <span className="flex-1 truncate">
                {outletName ?? "Pilih outlet"}
              </span>
              <span className="text-xs text-muted-foreground">Ganti</span>
              <ChevronRight className="size-3.5 text-muted-foreground" />
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem
            variant="destructive"
            nativeButton
            className="min-h-11 py-2.5 text-base"
            render={<button type="submit" className="w-full" />}
          >
            <LogOut className="size-4" />
            Keluar
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
