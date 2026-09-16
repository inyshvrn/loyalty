"use client";

import { LogOut, CircleUserRound } from "lucide-react";
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
}: {
  name: string;
  email: string;
  /** "nav" matches the icon-over-label look of BottomTabs, for use as a
   * bottom-nav "Akun" slot instead of the small avatar icon. */
  variant?: "avatar" | "nav";
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-semibold text-foreground">{name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
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
