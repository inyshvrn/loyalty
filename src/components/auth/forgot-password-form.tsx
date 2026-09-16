"use client";

import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import {
  forgotPasswordAction,
  type ActionState,
} from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    forgotPasswordAction,
    null
  );
  const [email, setEmail] = useState("");

  if (state?.success) {
    return <FormMessage success={state.success} />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button className="mt-1 h-11" type="submit" disabled={isPending}>
        {isPending ? "Mengirim..." : "Kirim Tautan Atur Ulang"}
      </Button>
    </form>
  );
}
