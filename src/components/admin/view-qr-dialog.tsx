"use client";

import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function ViewQrDialog({
  name,
  qrDataUrl,
}: {
  name: string;
  qrDataUrl: string | null;
}) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" type="button" />}>
        <QrCode className="size-4" />
        Lihat QR
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR {name}</DialogTitle>
          <DialogDescription>
            Tunjukkan ini ke barista kalau pelanggan tidak bisa akses QR-nya
            sendiri (HP mati/hilang).
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-2">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- inline data: URI generated per-request
            <img
              src={qrDataUrl}
              alt={`QR ${name}`}
              width={240}
              height={240}
              className="rounded-lg border border-border"
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Gagal membuat QR. Coba lagi.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
