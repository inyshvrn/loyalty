"use client";

import { useState, type FormEvent } from "react";
import { Cake, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/auth/form-message";
import { updateOwnDateOfBirthAction } from "@/lib/actions/customer";

function formatDate(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", timeZone: "UTC" });
}

/** Always-accessible edit entry point for the one field a customer can
 * self-edit — separate from BirthdayPromptDialog's one-time nudge, so
 * dismissing that popup (or just wanting to correct a typo later) never
 * becomes a dead end. */
export function BirthdayDateCard({ dateOfBirth }: { dateOfBirth: Date | null }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(dateOfBirth);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    const res = await updateOwnDateOfBirthAction(value);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    setSaved(new Date(value + "T00:00:00.000Z"));
    setOpen(false);
    setSaving(false);
  }

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-foreground">Tanggal Lahir</h2>
      <Card className="flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2 text-sm">
          <Cake className="size-4 text-muted-foreground" />
          <span className={saved ? "text-foreground" : "text-muted-foreground"}>
            {saved ? formatDate(saved) : "Belum diisi — isi buat dapat bonus ulang tahun"}
          </span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" variant="outline" type="button" />}>
            <Pencil className="size-3.5" />
            {saved ? "Ubah" : "Isi"}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tanggal Lahir</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormMessage error={error} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="birthday-date-card-dob">Tanggal lahir</Label>
                <Input
                  id="birthday-date-card-dob"
                  type="date"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
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
      </Card>
    </div>
  );
}
