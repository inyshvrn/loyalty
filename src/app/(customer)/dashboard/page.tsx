import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LoyaltyCard } from "@/components/loyalty-card";
import { Card } from "@/components/ui/card";

const mockCustomer = { name: "Sarah Wijaya", stamps: 6, threshold: 10 };

const recentVisits = [
  { date: "Hari ini, 10:24", label: "+1 stempel" },
  { date: "3 hari lalu", label: "+1 stempel" },
  { date: "6 hari lalu", label: "+1 stempel" },
];

export default function CustomerDashboardPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-6 md:max-w-lg md:px-8 md:py-10">
      <h1 className="mb-4 text-xl font-bold text-foreground">Kartu Saya</h1>

      <LoyaltyCard
        customerName={mockCustomer.name}
        stamps={mockCustomer.stamps}
        threshold={mockCustomer.threshold}
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
        <Card className="divide-y divide-border p-0">
          {recentVisits.map((visit) => (
            <div
              key={visit.date}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span className="text-muted-foreground">{visit.date}</span>
              <span className="font-medium text-foreground">
                {visit.label}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
