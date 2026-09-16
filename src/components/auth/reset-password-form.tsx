"use client";

import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import {
  resetPasswordAction,
  type ActionState,
} from "@/lib/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resetPasswordAction,
    null
  );
  // Controlled so a failed submit (mismatched confirmation, too short)
  // doesn't clear both fields — no reason to retype the one that was fine.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <input type="hidden" name="token" value={token} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata sandi baru</Label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Minimal 8 karakter"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Konfirmasi kata sandi</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Ulangi kata sandi baru"
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button className="mt-1 h-11" type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
      </Button>
    </form>
  );
}
