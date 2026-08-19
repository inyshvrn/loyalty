import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getStampThreshold } from "@/lib/loyalty";
import { ThresholdForm } from "@/components/admin/threshold-form";

export default async function AdminSettingsPage() {
  const threshold = await getStampThreshold();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-xl font-bold text-foreground">Pengaturan</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Stempel</CardTitle>
          <CardDescription>
            Jumlah stempel yang harus dikumpulkan pelanggan sebelum berhak
            atas satu produk gratis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThresholdForm currentThreshold={threshold} />
        </CardContent>
      </Card>
    </div>
  );
}
