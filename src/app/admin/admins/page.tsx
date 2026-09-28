import { redirect } from "next/navigation";
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
import { auth } from "@/lib/auth";
import { CreateAdminDialog } from "@/components/admin/create-admin-dialog";
import { ToggleAdminActiveButton } from "@/components/admin/toggle-admin-active-button";
import { EditAdminDialog } from "@/components/admin/edit-admin-dialog";
import { DeleteAdminButton } from "@/components/admin/delete-admin-button";
import { ResetAdminLockoutButton } from "@/components/admin/reset-admin-lockout-button";

export default async function AdminAdminsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Excludes the admin currently signed in on purpose — they manage their
  // own account from Akun (avatar menu), not from this list. That also
  // means deactivating/deleting someone here can never lock everyone out:
  // the admin doing it is never the one being acted on.
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", NOT: { id: session.user.id } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Admin</h1>
        <CreateAdminDialog />
      </div>

      {admins.length === 0 ? (
        <div className="rounded-xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada akun admin lain — cuma akun kamu sendiri.
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
                {admins.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-foreground">
                      {a.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant={a.isActive ? "secondary" : "outline"}>
                          {a.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                        {a.lockedUntil && a.lockedUntil > new Date() && (
                          <Badge variant="outline" className="border-destructive/40 text-destructive">
                            Terkunci
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {a.lockedUntil && a.lockedUntil > new Date() && (
                          <ResetAdminLockoutButton userId={a.id} />
                        )}
                        <ToggleAdminActiveButton
                          userId={a.id}
                          isActive={a.isActive}
                        />
                        <EditAdminDialog
                          userId={a.id}
                          name={a.name}
                          email={a.email}
                        />
                        <DeleteAdminButton userId={a.id} name={a.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-2 md:hidden">
            {admins.map((a) => (
              <Card
                key={a.id}
                className="flex-row items-center justify-between p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {a.name}
                    </p>
                    <Badge variant={a.isActive ? "secondary" : "outline"}>
                      {a.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    {a.lockedUntil && a.lockedUntil > new Date() && (
                      <Badge variant="outline" className="border-destructive/40 text-destructive">
                        Terkunci
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {a.lockedUntil && a.lockedUntil > new Date() && (
                    <ResetAdminLockoutButton userId={a.id} />
                  )}
                  <ToggleAdminActiveButton
                    userId={a.id}
                    isActive={a.isActive}
                  />
                  <EditAdminDialog
                    userId={a.id}
                    name={a.name}
                    email={a.email}
                  />
                  <DeleteAdminButton userId={a.id} name={a.name} />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
