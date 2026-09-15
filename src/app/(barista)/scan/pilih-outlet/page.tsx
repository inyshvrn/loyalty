import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OutletPicker } from "@/components/barista/outlet-picker";

export default async function PilihOutletPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [outlets, barista] = await Promise.all([
    prisma.outlet.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { outletId: true },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 md:py-10">
      <h1 className="mb-1 text-xl font-bold text-foreground">
        Kamu lagi di outlet mana?
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Dikonfirmasi sekali tiap kamu masuk — stempel yang kamu kasih hari ini
        bakal tercatat dari outlet ini.
      </p>
      <OutletPicker outlets={outlets} defaultOutletId={barista?.outletId ?? null} />
    </div>
  );
}
