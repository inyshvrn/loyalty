import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const customers = [
  { name: "Sarah Wijaya", email: "sarah@email.com", progress: "6/10", status: "Terverifikasi" },
  { name: "Budi Santoso", email: "budi@email.com", progress: "0/10", status: "Terverifikasi" },
  { name: "Nadia Putri", email: "nadia@email.com", progress: "3/10", status: "Belum Verifikasi" },
  { name: "Andi Pratama", email: "andi@email.com", progress: "10/10", status: "Terverifikasi" },
];

export default function AdminCustomersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-xl font-bold text-foreground">Pelanggan</h1>

      <div className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Cari nama, email, atau nomor HP" className="pl-8" />
      </div>

      {/* Desktop / tablet: real table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Progres</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.email}>
                <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.email}</TableCell>
                <TableCell className="text-muted-foreground">{c.progress}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={c.status === "Terverifikasi" ? "secondary" : "outline"}>
                    {c.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: stacked cards, no horizontal scroll */}
      <div className="flex flex-col gap-2 md:hidden">
        {customers.map((c) => (
          <Card key={c.email} className="flex-row items-center justify-between p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                <Badge variant={c.status === "Terverifikasi" ? "secondary" : "outline"}>
                  {c.status === "Terverifikasi" ? "Verified" : "Belum"}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {c.email} &middot; {c.progress} stempel
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Card>
        ))}
      </div>
    </div>
  );
}
