import Link from "next/link";
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
import { prisma } from "@/lib/prisma";
import { getStampThreshold, getCustomerProgressWithThreshold } from "@/lib/loyalty";

export default async function AdminCustomersPage(
  props: PageProps<"/admin/customers">
) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  const [threshold, customers] = await Promise.all([
    getStampThreshold(),
    prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" as const } },
                { email: { contains: q, mode: "insensitive" as const } },
                { phone: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      take: 100,
    }),
  ]);

  const rows = await Promise.all(
    customers.map(async (c) => ({
      ...c,
      progress: await getCustomerProgressWithThreshold(c.id, threshold),
    }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-xl font-bold text-foreground">Pelanggan</h1>

      <form className="relative mb-4 max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Cari nama, email, atau nomor HP"
          className="pl-8"
        />
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
          {q ? "Tidak ada pelanggan yang cocok." : "Belum ada pelanggan terdaftar."}
        </div>
      ) : (
        <>
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
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-foreground">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.progress.stamps}/{c.progress.threshold}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          c.progress.eligible
                            ? "default"
                            : c.emailVerified
                              ? "secondary"
                              : "outline"
                        }
                        className={c.progress.eligible ? "bg-reward text-reward-foreground border-transparent" : undefined}
                      >
                        {c.progress.eligible
                          ? "Siap Diklaim"
                          : c.emailVerified
                            ? "Terverifikasi"
                            : "Belum Verifikasi"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {rows.map((c) => (
              <Link key={c.id} href={`/admin/customers/${c.id}`}>
                <Card className="flex-row items-center justify-between p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {c.name}
                      </p>
                      {c.progress.eligible && (
                        <Badge className="border-transparent bg-reward text-reward-foreground">
                          Siap Diklaim
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.email} &middot; {c.progress.stamps}/{c.progress.threshold}{" "}
                      stempel
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
