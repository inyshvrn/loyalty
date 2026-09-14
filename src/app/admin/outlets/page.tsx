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
import { CreateOutletDialog } from "@/components/admin/create-outlet-dialog";
import { EditOutletDialog } from "@/components/admin/edit-outlet-dialog";
import { DeleteOutletButton } from "@/components/admin/delete-outlet-button";

export default async function AdminOutletsPage() {
  const outlets = await prisma.outlet.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { baristas: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Outlet</h1>
        <CreateOutletDialog />
      </div>

      {outlets.length === 0 ? (
        <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada outlet. Tambah outlet buat mulai kaitkan barista ke
          cabangnya masing-masing.
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jumlah Barista</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlets.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-foreground">
                      {o.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {o._count.baristas}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <EditOutletDialog outletId={o.id} name={o.name} />
                        <DeleteOutletButton outletId={o.id} name={o.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {outlets.map((o) => (
              <Card
                key={o.id}
                className="flex-row items-center justify-between p-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {o.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {o._count.baristas} barista
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <EditOutletDialog outletId={o.id} name={o.name} />
                  <DeleteOutletButton outletId={o.id} name={o.name} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
