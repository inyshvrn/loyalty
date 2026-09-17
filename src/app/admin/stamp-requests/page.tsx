import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStampGrantRequests } from "@/lib/loyalty";
import { formatRelativeIndonesian } from "@/lib/format";
import { StampGrantRequestActions } from "@/components/admin/stamp-grant-request-actions";

export default async function StampRequestsPage() {
  const { pending, reviewed } = await getStampGrantRequests();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-1 text-xl font-bold text-foreground">
        Persetujuan Stempel Awal
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Ajuan barista untuk kasih beberapa stempel sekaligus di kunjungan
        pertama pelanggan (transfer dari kartu kertas lama). Stempelnya sudah
        langsung aktif — cek kartu fisiknya, lalu setujui atau batalkan.
      </p>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Menunggu Persetujuan {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
            Tidak ada ajuan yang menunggu.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {pending.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/customers/${r.customer.id}`}
                    className="text-sm font-semibold text-foreground hover:underline"
                  >
                    {r.customer.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.customer.email} &middot; diajukan {r.requestedByUser.name}
                    {r.outlet && ` · ${r.outlet.name}`} &middot;{" "}
                    {formatRelativeIndonesian(r.createdAt)}
                  </p>
                  {r.note && (
                    <p className="mt-1 text-xs text-muted-foreground italic">
                      &ldquo;{r.note}&rdquo;
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                    +{r.count}
                  </span>
                  <StampGrantRequestActions
                    requestId={r.id}
                    customerName={r.customer.name}
                    count={r.count}
                  />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Riwayat Terbaru
        </h2>
        {reviewed.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada ajuan yang diproses.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {reviewed.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {r.customer.name}{" "}
                    <span className="font-normal text-muted-foreground">
                      &middot; +{r.count} stempel
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    diajukan {r.requestedByUser.name}
                    {r.reviewedByAdmin && ` · diproses ${r.reviewedByAdmin.name}`}
                    {r.reviewedAt && ` · ${formatRelativeIndonesian(r.reviewedAt)}`}
                  </p>
                </div>
                <Badge
                  variant={r.status === "APPROVED" ? "secondary" : "outline"}
                  className="shrink-0"
                >
                  {r.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
