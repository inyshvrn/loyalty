"use client";

import { useActionState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import { updateThresholdAction, type ActionState } from "@/lib/actions/admin";

export function ThresholdForm({ currentThreshold }: { currentThreshold: number }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateThresholdAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} success={state?.success} />
      <div className="flex max-w-40 flex-col gap-1.5">
        <Label htmlFor="threshold">Jumlah stempel</Label>
        <Input
          id="threshold"
          name="threshold"
          type="number"
          min={1}
          max={1000}
          defaultValue={currentThreshold}
          required
        />
      </div>
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
