import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import {
  getStampThreshold,
  getCustomerProgressWithThreshold,
  getRecentStamps,
  getRecentClaims,
} from "@/lib/loyalty";
import { formatRelativeIndonesian } from "@/lib/format";
import { AddManualStampButton } from "@/components/admin/add-manual-stamp-button";
import { RemoveStampButton } from "@/components/admin/remove-stamp-button";
import { CancelClaimButton } from "@/components/admin/cancel-claim-button";

export default async function AdminCustomerDetailPage(
  props: PageProps<"/admin/customers/[id]">
) {
  const { id } = await props.params;

  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") {
    notFound();
  }

  const threshold = await getStampThreshold();
  const [progress, stamps, claims] = await Promise.all([
    getCustomerProgressWithThreshold(id, threshold),
    getRecentStamps(id, 30),
    getRecentClaims(id, 30),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <Link
        href="/admin/customers"
        className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Kembali ke Pelanggan
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
          <p className="text-sm text-muted-foreground">
            {customer.email}
            {customer.phone ? ` · ${customer.phone}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant={customer.emailVerified ? "secondary" : "outline"}>
              {customer.emailVerified ? "Terverifikasi" : "Belum Verifikasi"}
            </Badge>
            {progress.eligible && (
              <Badge className="border-transparent bg-reward text-reward-foreground">
                Siap Diklaim
              </Badge>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {progress.stamps}/{progress.threshold}
          </p>
          <p className="text-xs text-muted-foreground">stempel saat ini</p>
        </div>
      </div>

      <div className="mb-8">
        <AddManualStampButton customerId={id} />
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Riwayat Kunjungan
        </h2>
        {stamps.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada kunjungan.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {stamps.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">
                  {formatRelativeIndonesian(s.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    +1 stempel
                  </span>
                  <RemoveStampButton stampId={s.id} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Riwayat Reward
        </h2>
        {claims.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada reward yang diklaim.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {claims.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {c.status === "CANCELLED"
                      ? "Klaim dibatalkan"
                      : "Reward diklaim"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeIndonesian(c.claimedAt)}
                  </p>
                </div>
                {c.status === "CONFIRMED" && (
                  <CancelClaimButton claimId={c.id} />
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
