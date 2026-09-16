"use client";

import { useState } from "react";
import { toast } from "sonner";
import { addStampAction, confirmRewardAction, type CustomerStatus } from "@/lib/actions/barista";

export function useCustomerActions(onUpdate: (data: CustomerStatus) => void) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleAddStamp(customerId: string) {
    setBusyId(customerId);
    try {
      const res = await addStampAction(customerId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onUpdate(res.data);
      if (res.stampAdded) {
        toast.success("Stempel ditambahkan", {
          description: `${res.data.name} · ${res.data.stamps}/${res.data.threshold}`,
        });
      } else {
        toast.info(res.reason, { description: res.data.name });
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmReward(customerId: string) {
    setBusyId(customerId);
    try {
      const res = await confirmRewardAction(customerId);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onUpdate(res.data);
      toast.success("Reward dikonfirmasi", {
        description: `${res.data.name} — stempel direset`,
      });
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setBusyId(null);
    }
  }

  return { busyId, handleAddStamp, handleConfirmReward };
}
