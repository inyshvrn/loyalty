"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Cake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormMessage } from "@/components/auth/form-message";
import { updateOwnDateOfBirthAction, dismissBirthdayPromptAction } from "@/lib/actions/customer";

const SNOOZE_KEY = "birthdayPromptSnoozedUntil";
const SNOOZE_DAYS = 14;

function isSnoozed(): boolean {
  try {
    const snoozedUntil = localStorage.getItem(SNOOZE_KEY);
    return !!snoozedUntil && Date.now() < Number(snoozedUntil);
  } catch {
    return false;
  }
}

// localStorage never changes here in a way another tab needs to react to
// live, so this is a no-op subscription — useSyncExternalStore is only
// being used for its getServerSnapshot support, so reading localStorage
// (unavailable during SSR) can't cause a hydration mismatch.
function subscribeNoop() {
  return () => {};
}

function snooze() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DAYS * 86_400_000));
  } catch {
    // best-effort only
  }
}

/** Only ever rendered when the server already knows the customer has no
 * dateOfBirth and hasn't permanently dismissed this — the remaining "has
 * the customer snoozed it recently" check reads localStorage. */
export function BirthdayPromptDialog() {
  const snoozed = useSyncExternalStore(subscribeNoop, isSnoozed, () => true);
  const [dismissedThisVisit, setDismissedThisVisit] = useState(false);
  const open = !snoozed && !dismissedThisVisit;

  const [step, setStep] = useState<"offer" | "fill">("offer");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleDismissForever() {
    setDismissedThisVisit(true);
    try {
      await dismissBirthdayPromptAction();
    } catch {
      // non-critical — worst case the prompt reappears next visit
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    const res = await updateOwnDateOfBirthAction(dateOfBirth);
    if (!res.ok) {
      setError(res.error);
      setSaving(false);
      return;
    }
    setDismissedThisVisit(true);
    setSaving(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Closing any way other than "Jangan Tampilkan Lagi" (which already
        // handles itself above) counts as a snooze — an accidental Escape/
        // backdrop click shouldn't feel like a permanent opt-out.
        if (!next) {
          snooze();
          setDismissedThisVisit(true);
        }
      }}
    >
      <DialogContent>
        {step === "offer" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Cake className="size-5 text-primary" />
                Mau dapat bonus pas ulang tahun?
              </DialogTitle>
              <DialogDescription>
                Isi tanggal lahir kamu, dan kami kasih diskon khusus kalau
                kamu mampir pas hari ulang tahunmu.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-start">
              <Button type="button" className="w-full" onClick={() => setStep("fill")}>
                Isi Sekarang
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  snooze();
                  setDismissedThisVisit(true);
                }}
              >
                Ingatkan Saya Nanti
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleDismissForever}
              >
                Jangan Tampilkan Lagi
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Tanggal Lahir</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormMessage error={error} />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="birthday-prompt-dob">Tanggal lahir</Label>
                <Input
                  id="birthday-prompt-dob"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full" disabled={saving}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
