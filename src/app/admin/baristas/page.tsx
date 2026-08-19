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
import { prisma } from "@/lib/prisma";
import { CreateBaristaDialog } from "@/components/admin/create-barista-dialog";
import { ToggleBaristaActiveButton } from "@/components/admin/toggle-barista-active-button";

export default async function AdminBaristasPage() {
  const baristas = await prisma.user.findMany({
    where: { role: "BARISTA" },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Barista</h1>
        <CreateBaristaDialog />
      </div>

      {baristas.length === 0 ? (
        <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada akun barista.
        </div>
      ) : (
        <>
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
                  <TableRow key={b.id}>
                    <TableCell className="font-medium text-foreground">
                      {b.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={b.isActive ? "secondary" : "outline"}>
                        {b.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <ToggleBaristaActiveButton
                        userId={b.id}
                        isActive={b.isActive}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {baristas.map((b) => (
              <Card
                key={b.id}
                className="flex-row items-center justify-between p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {b.name}
                    </p>
                    <Badge variant={b.isActive ? "secondary" : "outline"}>
                      {b.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {b.email}
                  </p>
                </div>
                <ToggleBaristaActiveButton
                  userId={b.id}
                  isActive={b.isActive}
                />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
