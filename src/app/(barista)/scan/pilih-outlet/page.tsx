import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OutletPicker } from "@/components/barista/outlet-picker";

export default async function PilihOutletPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Reachable two ways: forced here once per fresh login (outletConfirmed
  // still false), or visited voluntarily afterward from the Akun menu to
  // switch outlets mid-shift — the copy and the way back differ between
  // the two.
  const isSwitching = session.user.outletConfirmed === true;

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
        {isSwitching ? "Pindah ke outlet mana?" : "Kamu lagi di outlet mana?"}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {isSwitching
          ? "Buat yang kebagian jaga lebih dari satu outlet dalam sehari — stempel berikutnya bakal tercatat dari outlet yang dipilih di sini."
          : "Dikonfirmasi sekali tiap kamu masuk — stempel yang kamu kasih hari ini bakal tercatat dari outlet ini."}
      </p>
      <OutletPicker outlets={outlets} defaultOutletId={barista?.outletId ?? null} />
      {isSwitching && (
        <Link
          href="/scan"
          className="mt-3 self-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Batal, kembali ke Scan
        </Link>
      )}
    </div>
  );
}
