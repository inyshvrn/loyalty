import Link from "next/link";
import { ChevronRight } from "lucide-react";
import QRCode from "qrcode";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoyaltyCard } from "@/components/loyalty-card";
import { Card } from "@/components/ui/card";
import { getCustomerProgress, getRecentStamps } from "@/lib/loyalty";
import { formatRelativeIndonesian } from "@/lib/format";

export default async function CustomerDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const customerId = session.user.id;
  const [progress, recentStamps] = await Promise.all([
    getCustomerProgress(customerId),
    getRecentStamps(customerId, 3),
  ]);

  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(customerId, { margin: 1, width: 240 });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-6 md:max-w-lg md:px-8 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Kartu Saya</h1>

      <LoyaltyCard
        customerName={session.user.name ?? ""}
        stamps={progress.stamps}
        threshold={progress.threshold}
        qrDataUrl={qrDataUrl}
      />

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Kunjungan Terakhir
          </h2>
          <Link
            href="/history"
            className="flex items-center text-xs font-semibold text-primary hover:underline"
          >
            Lihat semua
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        {recentStamps.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada kunjungan. Tunjukkan QR Anda ke barista saat checkout.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {recentStamps.map((stamp) => (
              <div
                key={stamp.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {formatRelativeIndonesian(stamp.createdAt)}
                </span>
                <span className="font-medium text-foreground">
                  +1 stempel
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
