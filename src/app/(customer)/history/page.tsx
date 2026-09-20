import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getRecentStamps, getRecentClaims } from "@/lib/loyalty";
import { getReferralCreditsForCustomer } from "@/lib/referral";
import { formatRelativeIndonesian, formatDiscountAmount } from "@/lib/format";

const creditStatusLabel = {
  AVAILABLE: "Tersedia",
  REDEEMED: "Sudah dipakai",
  CANCELLED: "Dibatalkan",
} as const;

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [visits, claims, referralCredits] = await Promise.all([
    getRecentStamps(session.user.id, 50),
    getRecentClaims(session.user.id, 50),
    getReferralCreditsForCustomer(session.user.id, 50),
  ]);

  return (
    <div className="mx-auto max-w-md px-4 py-6 md:max-w-lg md:px-8 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Riwayat</h1>

      <Tabs defaultValue="visits">
        <TabsList className="w-full">
          <TabsTrigger value="visits">Kunjungan</TabsTrigger>
          <TabsTrigger value="claims">Reward Diklaim</TabsTrigger>
          <TabsTrigger value="referrals">Diskon Referral</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-4">
          {visits.length === 0 ? (
            <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada kunjungan.
            </Card>
          ) : (
            <Card className="divide-y divide-border p-0">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-muted-foreground">
                    {formatRelativeIndonesian(visit.createdAt)}
                  </span>
                  <span className="font-medium text-foreground">
                    +1 stempel
                  </span>
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
              {claims.map((claim) => (
                <div key={claim.id} className="px-4 py-3 text-sm">
                  <p className="font-medium text-foreground">
                    {claim.status === "CANCELLED"
                      ? "Klaim dibatalkan admin"
                      : "Reward diklaim oleh barista"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeIndonesian(claim.claimedAt)}
                  </p>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          {referralCredits.length === 0 ? (
            <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
              Belum ada diskon referral. Ajak teman lewat kode referral kamu di halaman Kartu Saya.
            </Card>
          ) : (
            <Card className="divide-y divide-border p-0">
              {referralCredits.map((credit) => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      Diskon {formatDiscountAmount(credit.discountType, credit.discountValue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeIndonesian(credit.createdAt)}
                    </p>
                  </div>
                  <Badge variant={credit.status === "AVAILABLE" ? "secondary" : "outline"}>
                    {creditStatusLabel[credit.status]}
                  </Badge>
                </div>
              ))}
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
