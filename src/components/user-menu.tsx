"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LogOut, CircleUserRound, Store, ChevronRight, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { updateOwnNameAction } from "@/lib/actions/barista";

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
   * present. Omitted entirely for customer/admin menus. Its presence also
   * gates the self-service "Ubah Nama" row, since that's barista-only too. */
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
  const isBarista = stats !== undefined;
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    const res = await updateOwnNameAction(newName);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    setNameDialogOpen(false);
    setSaving(false);
  }

  return (
    <>
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
          {isBarista && (
            <DropdownMenuItem
              nativeButton
              className="min-h-11 gap-2.5 py-2.5 text-base"
              render={<button type="button" className="w-full" />}
              onClick={() => {
                setNewName(name);
                setError(undefined);
                setNameDialogOpen(true);
              }}
            >
              <Pencil className="size-4" />
              Ubah Nama
            </DropdownMenuItem>
          )}
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

      {isBarista && (
        <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ubah Nama</DialogTitle>
              <DialogDescription>
                Nama ini yang bakal kelihatan di riwayat scan dan klaim reward.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveName} className="flex flex-col gap-4">
              <FormMessage error={error} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-name">Nama</Label>
                <Input
                  id="new-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  minLength={2}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
