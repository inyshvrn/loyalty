"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import {
  resendVerificationAction,
  type ActionState,
} from "@/lib/actions/auth";

export function ResendVerificationForm({
  defaultEmail,
}: {
  defaultEmail?: string;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    resendVerificationAction,
    null
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <FormMessage error={state?.error} success={state?.success} />
      <div className="flex flex-col gap-1.5 text-left">
        <Label htmlFor="resend-email">Email</Label>
        <Input
          id="resend-email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          defaultValue={defaultEmail}
          required
        />
      </div>
      <Button variant="outline" type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Mengirim..." : "Kirim Ulang Email"}
      </Button>
    </form>
  );
}
