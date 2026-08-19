import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getRecentStamps, getRecentClaims } from "@/lib/loyalty";
import { formatRelativeIndonesian } from "@/lib/format";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [visits, claims] = await Promise.all([
    getRecentStamps(session.user.id, 50),
    getRecentClaims(session.user.id, 50),
  ]);

  return (
    <div className="mx-auto max-w-md px-4 py-6 md:max-w-lg md:px-8 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Riwayat</h1>

      <Tabs defaultValue="visits">
        <TabsList className="w-full">
          <TabsTrigger value="visits">Kunjungan</TabsTrigger>
          <TabsTrigger value="claims">Reward Diklaim</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
