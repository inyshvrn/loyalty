import { StatCard } from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  countTotalCustomers,
  countStampsToday,
  countConfirmedClaimsThisMonth,
  countEligibleCustomers,
  getRecentActivity,
} from "@/lib/loyalty";
import { formatRelativeIndonesian } from "@/lib/format";

export default async function AdminDashboardPage() {
  const [totalCustomers, stampsToday, claimsThisMonth, eligibleCount, activity] =
    await Promise.all([
      countTotalCustomers(),
      countStampsToday(),
      countConfirmedClaimsThisMonth(),
      countEligibleCustomers(),
      getRecentActivity(10),
    ]);

  const stats = [
    { label: "Total Pelanggan", value: totalCustomers },
    { label: "Stempel Hari Ini", value: stampsToday },
    { label: "Reward Bulan Ini", value: claimsThisMonth },
    { label: "Siap Klaim", value: eligibleCount, accent: eligibleCount > 0 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-xl font-bold text-foreground">
        Ringkasan Hari Ini
      </h1>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Aktivitas Terbaru
      </h2>
      {activity.length === 0 ? (
        <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada aktivitas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Aktivitas</TableHead>
                <TableHead className="text-right">Waktu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activity.map((entry) => (
                <TableRow key={`${entry.type}-${entry.id}`}>
                  <TableCell className="font-medium text-foreground">
                    {entry.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.type === "stamp" ? (
                      "+1 stempel"
                    ) : entry.status === "CANCELLED" ? (
                      <Badge variant="outline">Klaim dibatalkan</Badge>
                    ) : (
                      <Badge variant="secondary">Reward diklaim</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatRelativeIndonesian(entry.at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
