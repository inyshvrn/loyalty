"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, Pencil, KeyRound, Store, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/auth/form-message";
import { logoutAction } from "@/lib/actions/auth";
import { updateOwnNameAction, updateOwnPasswordAction } from "@/lib/actions/barista";
import type { BaristaActivityStats } from "@/lib/loyalty";

export function AkunView({
  name,
  email,
  stats,
  outletName,
}: {
  name: string;
  email: string;
  stats: BaristaActivityStats;
  outletName: string | null;
}) {
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameError(undefined);
    const res = await updateOwnNameAction(newName);
    if (!res.ok) {
      setNameError(res.error);
      setSavingName(false);
      return;
    }
    setNameDialogOpen(false);
    setSavingName(false);
  }

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();

  async function handleSavePassword(e: FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError(undefined);
    const res = await updateOwnPasswordAction(currentPassword, newPassword);
    if (!res.ok) {
      setPasswordError(res.error);
      setSavingPassword(false);
      return;
    }
    setPasswordDialogOpen(false);
    setSavingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 md:py-10">
      {/* Mobile already has an "Akun" tab in the persistent bottom nav to
       * get here and back — this back link is a desktop-only affordance,
       * since desktop has no such tab bar. */}
      <Link
        href="/scan"
        className="mb-4 hidden items-center gap-1 self-start text-xs font-semibold text-muted-foreground hover:text-foreground md:inline-flex"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke Scan
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="mb-1 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {stats.totalStamps}
          </p>
          <p className="text-xs text-muted-foreground">Stempel diberikan</p>
        </Card>
        <Card className="p-4">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {stats.totalClaims}
          </p>
          <p className="text-xs text-muted-foreground">Reward dikonfirmasi</p>
        </Card>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        Bulan ini: {stats.stampsThisMonth} stempel &middot; {stats.claimsThisMonth} reward
      </p>

      <Card className="mb-6 divide-y divide-border p-0">
        <Link
          href="/scan/pilih-outlet"
          className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-secondary"
        >
          <Store className="size-4 text-muted-foreground" />
          <span className="flex-1 font-medium text-foreground">
            {outletName ?? "Belum pilih outlet"}
          </span>
          <span className="text-xs text-muted-foreground">Ganti</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </Link>
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm hover:bg-secondary"
          onClick={() => {
            setNewName(name);
            setNameError(undefined);
            setNameDialogOpen(true);
          }}
        >
          <Pencil className="size-4 text-muted-foreground" />
          <span className="flex-1 font-medium text-foreground">Ubah Nama</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm hover:bg-secondary"
          onClick={() => {
            setCurrentPassword("");
            setNewPassword("");
            setPasswordError(undefined);
            setPasswordDialogOpen(true);
          }}
        >
          <KeyRound className="size-4 text-muted-foreground" />
          <span className="flex-1 font-medium text-foreground">Ubah Kata Sandi</span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </Card>

      <form action={logoutAction}>
        <Button
          type="submit"
          variant="outline"
          className="h-11 w-full border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Keluar
        </Button>
      </form>

      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Nama</DialogTitle>
            <DialogDescription>
              Nama ini yang bakal kelihatan di riwayat scan dan klaim reward.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveName} className="flex flex-col gap-4">
            <FormMessage error={nameError} />
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
              <Button type="submit" disabled={savingName}>
                {savingName ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Kata Sandi</DialogTitle>
            <DialogDescription>
              Masukkan kata sandi lama dulu buat konfirmasi sebelum diganti.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
            <FormMessage error={passwordError} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="current-password">Kata sandi lama</Label>
              <PasswordInput
                id="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Kata sandi baru</Label>
              <PasswordInput
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                minLength={8}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={savingPassword}>
                {savingPassword ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
