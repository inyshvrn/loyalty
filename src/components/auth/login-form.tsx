"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { loginAction, type ActionState } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    loginAction,
    null
  );

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
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
      <Button className="mt-1" type="submit" disabled={isPending}>
        {isPending ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
