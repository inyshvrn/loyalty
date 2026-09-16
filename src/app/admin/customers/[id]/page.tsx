import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import {
  getStampThreshold,
  getCustomerProgressWithThreshold,
  getRecentStampsWithStaff,
  getRecentClaimsWithStaff,
} from "@/lib/loyalty";
import { formatRelativeIndonesian } from "@/lib/format";
import { AddManualStampButton } from "@/components/admin/add-manual-stamp-button";
import { RemoveStampButton } from "@/components/admin/remove-stamp-button";
import { CancelClaimButton } from "@/components/admin/cancel-claim-button";
import { EditCustomerDialog } from "@/components/admin/edit-customer-dialog";
import { DeleteCustomerButton } from "@/components/admin/delete-customer-button";
import { ViewQrDialog } from "@/components/admin/view-qr-dialog";
import { GrantInitialStampsDialog } from "@/components/admin/grant-initial-stamps-dialog";

export default async function AdminCustomerDetailPage(
  props: PageProps<"/admin/customers/[id]">
) {
  const { id } = await props.params;

  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") {
    notFound();
  }

  const threshold = await getStampThreshold();
  const [progress, stamps, claims, everStampCount] = await Promise.all([
    getCustomerProgressWithThreshold(id, threshold),
    getRecentStampsWithStaff(id, 30),
    getRecentClaimsWithStaff(id, 30),
    prisma.stamp.count({ where: { customerId: id } }),
  ]);

  let qrDataUrl: string | null = null;
  try {
    qrDataUrl = await QRCode.toDataURL(customer.id, { margin: 1, width: 240 });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
  }

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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
            <EditCustomerDialog
              userId={customer.id}
              name={customer.name}
              email={customer.email}
              phone={customer.phone}
            />
            <DeleteCustomerButton userId={customer.id} name={customer.name} />
            <ViewQrDialog name={customer.name} qrDataUrl={qrDataUrl} />
          </div>
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

      <div className="mb-8 flex flex-wrap gap-2">
        <AddManualStampButton customerId={id} />
        {everStampCount === 0 && <GrantInitialStampsDialog customerId={id} />}
      </div>

      <Tabs defaultValue="visits">
        <TabsList className="w-full max-w-xs">
          <TabsTrigger value="visits">Kunjungan</TabsTrigger>
          <TabsTrigger value="claims">Reward</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-4">
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
                    {" · oleh "}
                    {s.scannedByBarista.name}
                    {s.outlet && ` · ${s.outlet.name}`}
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
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
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
                      {" · oleh "}
                      {c.status === "CANCELLED" && c.cancelledByAdmin
                        ? c.cancelledByAdmin.name
                        : c.confirmedByBarista.name}
                    </p>
                  </div>
                  {c.status === "CONFIRMED" && (
                    <CancelClaimButton claimId={c.id} />
                  )}
                </div>
              ))}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
