import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const baristas = [
  { name: "Rangga Saputra", email: "rangga@handaicoffee.id", active: true },
  { name: "Dewi Lestari", email: "dewi@handaicoffee.id", active: true },
  { name: "Fajar Hidayat", email: "fajar@handaicoffee.id", active: false },
];

export default function AdminBaristasPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Barista</h1>
        <Button type="button" size="sm">
          <UserPlus className="size-4" />
          Tambah Barista
        </Button>
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {baristas.map((b) => (
              <TableRow key={b.email}>
                <TableCell className="font-medium text-foreground">{b.name}</TableCell>
                <TableCell className="text-muted-foreground">{b.email}</TableCell>
                <TableCell>
                  <Badge variant={b.active ? "secondary" : "outline"}>
                    {b.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" type="button">
                    {b.active ? "Nonaktifkan" : "Aktifkan"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 md:hidden">
        {baristas.map((b) => (
          <Card key={b.email} className="flex-row items-center justify-between p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{b.name}</p>
                <Badge variant={b.active ? "secondary" : "outline"}>
                  {b.active ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">{b.email}</p>
            </div>
            <Button variant="ghost" size="sm" type="button" className="shrink-0">
              {b.active ? "Nonaktifkan" : "Aktifkan"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
