"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera } from "lucide-react";

const REGION_ID = "handai-qr-scan-region";

/**
 * Mounts an html5-qrcode camera scanner into view. Starts on mount, stops on
 * unmount — the parent controls the camera's lifetime by mounting this only
 * while the Scan QR tab is actually selected.
 */
export function QrScanner({ onDecode }: { onDecode: (text: string) => void }) {
  const onDecodeRef = useRef(onDecode);
  const [status, setStatus] = useState<"starting" | "running" | "error">("starting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(REGION_ID);

    // Calling stop() before start() has actually resolved throws ("Cannot
    // stop, scanner is not running"), which happens easily since React can
    // mount/cleanup/remount an effect quickly (dev Strict Mode, fast tab
    // switching). Keep a handle on the start promise so cleanup always waits
    // for it to settle before ever touching stop().
    const startPromise = scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decodedText) => onDecodeRef.current(decodedText),
      () => {
        // Per-frame "no code found" callback — fires continuously while
        // scanning with nothing in view. Expected, nothing to do.
      }
    );

    startPromise
      .then(() => {
        if (!cancelled) setStatus("running");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(err instanceof Error ? err.message : String(err));
      });

    return () => {
      cancelled = true;
      startPromise
        .then(() => scanner.stop())
        .catch(() => {
          // Start never succeeded, or stop failed — nothing left to stop.
        })
        .finally(() => {
          try {
            scanner.clear();
          } catch {
            // already cleared
          }
        });
    };
  }, []);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary">
      <div
        id={REGION_ID}
        className="size-full [&_video]:size-full [&_video]:object-cover"
      />
      {status !== "running" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary px-6 text-center text-muted-foreground">
          <Camera className="size-8" strokeWidth={1.5} />
          {status === "starting" && (
            <p className="text-sm font-medium">Mengaktifkan kamera...</p>
          )}
          {status === "error" && (
            <>
              <p className="text-sm font-medium">Tidak bisa mengakses kamera.</p>
              <p className="text-xs">
                Izinkan akses kamera di browser, atau gunakan tab &quot;Cari
                Manual&quot;.
              </p>
              {errorMessage && (
                <p className="text-[10px] opacity-70">{errorMessage}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
