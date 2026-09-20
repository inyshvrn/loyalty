"use client";

import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormMessage } from "@/components/auth/form-message";
import { updateReferralDiscountAction, type ActionState } from "@/lib/actions/admin";
import type { DiscountType } from "@/generated/prisma/client";

export function ReferralDiscountForm({
  currentType,
  currentValue,
}: {
  currentType: DiscountType;
  currentValue: number;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateReferralDiscountAction,
    null
  );
  const [type, setType] = useState<DiscountType>(currentType);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} success={state?.success} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex max-w-44 flex-col gap-1.5">
          <Label htmlFor="referralDiscountType">Jenis diskon</Label>
          <Select
            name="referralDiscountType"
            value={type}
            onValueChange={(v) => setType(v as DiscountType)}
          >
            <SelectTrigger id="referralDiscountType" className="w-full">
              <SelectValue>
                {(value: DiscountType) => (value === "PERCENT" ? "Persen (%)" : "Nominal (Rp)")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENT">Persen (%)</SelectItem>
              <SelectItem value="FIXED">Nominal (Rp)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex max-w-40 flex-col gap-1.5">
          <Label htmlFor="referralDiscountValue">
            {type === "PERCENT" ? "Persen" : "Nominal (Rp)"}
          </Label>
          <Input
            id="referralDiscountValue"
            name="referralDiscountValue"
            type="number"
            min={1}
            max={type === "PERCENT" ? 100 : undefined}
            defaultValue={currentValue}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-fit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
