"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { registerAction, type ActionState } from "@/lib/actions/auth";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nama lengkap</Label>
        <Input id="name" name="name" placeholder="Sarah Wijaya" required />
      </div>
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
        <Label htmlFor="phone">Nomor HP</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="08xx xxxx xxxx"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata sandi</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Minimal 8 karakter"
          minLength={8}
          required
        />
      </div>
      <Button className="mt-1" type="submit" disabled={isPending}>
        {isPending ? "Mendaftar..." : "Daftar Sekarang"}
      </Button>
    </form>
  );
}
