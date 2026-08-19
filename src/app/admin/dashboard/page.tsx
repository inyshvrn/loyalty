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

const stats = [
  { label: "Total Pelanggan", value: 312 },
  { label: "Stempel Hari Ini", value: 18 },
  { label: "Reward Bulan Ini", value: 24 },
  { label: "Siap Klaim", value: 5, accent: true },
];

const activity = [
  { name: "Sarah Wijaya", action: "+1 stempel", status: "6/10", variant: "secondary" as const },
  { name: "Budi Santoso", action: "Reward diklaim", status: "Diklaim", variant: "default" as const },
  { name: "Nadia Putri", action: "+1 stempel", status: "3/10", variant: "secondary" as const },
  { name: "Andi Pratama", action: "+1 stempel", status: "10/10", variant: "default" as const },
];

export default function AdminDashboardPage() {
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
      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Aktivitas</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activity.map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-foreground">
                  {row.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.action}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.variant}>{row.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
