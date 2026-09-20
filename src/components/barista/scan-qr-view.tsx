"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/barista/qr-scanner";
import { CustomerStatusCard } from "@/components/barista/customer-status-card";
import { useCustomerActions } from "@/lib/hooks/use-customer-actions";
import { addStampAction, type CustomerStatus } from "@/lib/actions/barista";

export function ScanQrView() {
  const [scanResult, setScanResult] = useState<CustomerStatus | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [decoding, setDecoding] = useState(false);

  function updateScanResult(data: CustomerStatus) {
    setScanResult((prev) => (prev && prev.id === data.id ? data : prev));
  }

  const { busyId, handleAddStamp, handleConfirmReward, handleRedeemCredit } =
    useCustomerActions(updateScanResult);

  function resetScan() {
    setScanResult(null);
    setScanError(null);
    setScanning(true);
  }

  async function handleDecode(customerId: string) {
    if (!scanning || decoding) return; // one decode per scan session
    setScanning(false); // stop the camera immediately so it can't re-fire on the same QR
    setDecoding(true);
    try {
      const res = await addStampAction(customerId);
      if (!res.ok) {
        setScanError(res.error);
        toast.error(res.error);
        return;
      }
      setScanResult(res.data);
      if (res.stampAdded) {
        toast.success("Stempel ditambahkan", {
          description: `${res.data.name} · ${res.data.stamps}/${res.data.threshold}`,
        });
      } else {
        toast.info(res.reason, { description: res.data.name });
      }
    } catch {
      setScanError("Terjadi kesalahan. Coba lagi.");
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setDecoding(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {scanning && <QrScanner onDecode={handleDecode} />}
      {!scanning && (
        <>
          {scanResult && (
            <CustomerStatusCard
              status={scanResult}
              busy={busyId === scanResult.id}
              onAddStamp={() => handleAddStamp(scanResult.id)}
              onConfirmReward={() => handleConfirmReward(scanResult.id)}
              onGrantRequested={updateScanResult}
              onRedeemCredit={() => handleRedeemCredit(scanResult.id)}
            />
          )}
          {scanError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {scanError}
            </p>
          )}
          <Button className="h-11" type="button" variant="outline" onClick={resetScan}>
            Scan Lagi
          </Button>
        </>
      )}
    </div>
  );
}
