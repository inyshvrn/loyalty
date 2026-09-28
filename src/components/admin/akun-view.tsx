"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Pencil, Mail, KeyRound, ChevronRight } from "lucide-react";
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
import {
  updateOwnAdminNameAction,
  updateOwnAdminEmailAction,
  updateOwnAdminPasswordAction,
} from "@/lib/actions/admin";

export function AdminAkunView({ name, email }: { name: string; email: string }) {
  const router = useRouter();

  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState(name);
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>();

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameError(undefined);
    const res = await updateOwnAdminNameAction(newName);
    if (!res.ok) {
      setNameError(res.error);
      setSavingName(false);
      return;
    }
    setNameDialogOpen(false);
    setSavingName(false);
    // Without this, the heading above still holds the name this page was
    // first server-rendered with — unstable_update() alone updates the
    // session but doesn't re-fetch that (same fix as the barista Akun page).
    router.refresh();
  }

  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailPassword, setEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState(email);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();

  async function handleSaveEmail(e: FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    setEmailError(undefined);
    const res = await updateOwnAdminEmailAction(emailPassword, newEmail);
    if (!res.ok) {
      setEmailError(res.error);
      setSavingEmail(false);
      return;
    }
    setEmailDialogOpen(false);
    setSavingEmail(false);
    setEmailPassword("");
    router.refresh();
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
    const res = await updateOwnAdminPasswordAction(currentPassword, newPassword);
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
      {/* Admin doesn't have a persistent bottom nav on mobile the way
       * barista does, so this back link stays visible at every width
       * instead of being desktop-only. */}
      <Link
        href="/admin/dashboard"
        className="mb-4 inline-flex items-center gap-1 self-start text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <Card className="mb-6 divide-y divide-border p-0">
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
            setEmailPassword("");
            setNewEmail(email);
            setEmailError(undefined);
            setEmailDialogOpen(true);
          }}
        >
          <Mail className="size-4 text-muted-foreground" />
          <span className="flex-1 font-medium text-foreground">Ubah Email</span>
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
          </DialogHeader>
          <form onSubmit={handleSaveName} className="flex flex-col gap-4">
            <FormMessage error={nameError} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-new-name">Nama</Label>
              <Input
                id="admin-new-name"
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

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Email</DialogTitle>
            <DialogDescription>
              Email ini dipakai buat masuk — masukkan kata sandi kamu dulu buat konfirmasi.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEmail} className="flex flex-col gap-4">
            <FormMessage error={emailError} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-current-password-email">Kata sandi</Label>
              <PasswordInput
                id="admin-current-password-email"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-new-email">Email baru</Label>
              <Input
                id="admin-new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={savingEmail}>
                {savingEmail ? "Menyimpan..." : "Simpan"}
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
              <Label htmlFor="admin-current-password">Kata sandi lama</Label>
              <PasswordInput
                id="admin-current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="admin-new-password">Kata sandi baru</Label>
              <PasswordInput
                id="admin-new-password"
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
