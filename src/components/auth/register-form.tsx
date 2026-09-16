"use client";

import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { registerAction, type ActionState } from "@/lib/actions/auth";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    registerAction,
    null
  );
  // Controlled so a failed submit (duplicate email, weak password, etc.)
  // never clears what was typed — no reason to retype every field over a
  // mistake in just one of them.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nama lengkap</Label>
        <Input
          id="name"
          name="name"
          placeholder="Sarah Wijaya"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Nomor HP</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="08xx xxxx xxxx"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Kata sandi</Label>
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
      <Button className="mt-1 h-11" type="submit" disabled={isPending}>
        {isPending ? "Mendaftar..." : "Daftar Sekarang"}
      </Button>
    </form>
  );
}
