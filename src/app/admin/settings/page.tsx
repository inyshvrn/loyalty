import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
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
        <CardContent className="flex flex-col gap-4">
          <div className="flex max-w-40 flex-col gap-1.5">
            <Label htmlFor="threshold">Jumlah stempel</Label>
            <Input id="threshold" type="number" min={1} defaultValue={10} />
          </div>
          <Button type="button" className="w-fit">
            Simpan Perubahan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
