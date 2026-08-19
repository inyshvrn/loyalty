import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const visits = [
  { date: "Hari ini, 10:24" },
  { date: "3 hari lalu" },
  { date: "6 hari lalu" },
  { date: "2 minggu lalu" },
  { date: "3 minggu lalu" },
  { date: "1 bulan lalu" },
];

const claims = [{ date: "2 bulan lalu", note: "Reward diklaim oleh barista" }];

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6 md:max-w-lg md:px-8 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Riwayat</h1>

      <Tabs defaultValue="visits">
        <TabsList className="w-full">
          <TabsTrigger value="visits">Kunjungan</TabsTrigger>
          <TabsTrigger value="claims">Reward Diklaim</TabsTrigger>
        </TabsList>

        <TabsContent value="visits" className="mt-4">
          <Card className="divide-y divide-border p-0">
            {visits.map((visit, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="text-muted-foreground">{visit.date}</span>
                <span className="font-medium text-foreground">
                  +1 stempel
                </span>
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="mt-4">
          <Card className="divide-y divide-border p-0">
            {claims.map((claim, i) => (
              <div key={i} className="px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{claim.note}</p>
                <p className="text-xs text-muted-foreground">{claim.date}</p>
              </div>
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
