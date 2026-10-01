"use client";

import { useActionState, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormMessage } from "@/components/auth/form-message";
import { updateBirthdayRewardSettingAction, type ActionState } from "@/lib/actions/admin";
import type { DiscountType } from "@/generated/prisma/client";

export function BirthdayRewardForm({
  currentEnabled,
  currentMinStamps,
  currentType,
  currentValue,
}: {
  currentEnabled: boolean;
  currentMinStamps: number;
  currentType: DiscountType;
  currentValue: number;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateBirthdayRewardSettingAction,
    null
  );
  const [enabled, setEnabled] = useState(currentEnabled);
  const [type, setType] = useState<DiscountType>(currentType);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage error={state?.error} success={state?.success} />
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="birthdayRewardEnabled">Aktifkan reward ulang tahun</Label>
        <Switch
          id="birthdayRewardEnabled"
          name="birthdayRewardEnabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
      </div>
      <div className="flex max-w-56 flex-col gap-1.5">
        <Label htmlFor="birthdayRewardMinStamps">Minimal stempel yang pernah didapat</Label>
        <Input
          id="birthdayRewardMinStamps"
          name="birthdayRewardMinStamps"
          type="number"
          min={0}
          defaultValue={currentMinStamps}
          required
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex max-w-44 flex-col gap-1.5">
          <Label htmlFor="birthdayRewardDiscountType">Jenis diskon</Label>
          <Select
            name="birthdayRewardDiscountType"
            value={type}
            onValueChange={(v) => setType(v as DiscountType)}
          >
            <SelectTrigger id="birthdayRewardDiscountType" className="w-full">
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
          <Label htmlFor="birthdayRewardDiscountValue">
            {type === "PERCENT" ? "Persen" : "Nominal (Rp)"}
          </Label>
          <Input
            id="birthdayRewardDiscountValue"
            name="birthdayRewardDiscountValue"
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
