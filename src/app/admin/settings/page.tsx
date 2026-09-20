import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getStampThreshold } from "@/lib/loyalty";
import { getReferralDiscountSetting } from "@/lib/referral";
import { ThresholdForm } from "@/components/admin/threshold-form";
import { ReferralDiscountForm } from "@/components/admin/referral-discount-form";

export default async function AdminSettingsPage() {
  const [threshold, referralDiscount] = await Promise.all([
    getStampThreshold(),
    getReferralDiscountSetting(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 text-xl font-bold text-foreground">Pengaturan</h1>

      <Card className="mb-4">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Diskon Referral</CardTitle>
          <CardDescription>
            Diskon yang didapat pelanggan tiap kali kode referralnya dipakai
            teman baru yang berhasil verifikasi email. Perubahan ini tidak
            mengubah diskon yang sudah didapat sebelumnya.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralDiscountForm
            currentType={referralDiscount.discountType}
            currentValue={referralDiscount.discountValue}
          />
        </CardContent>
      </Card>
    </div>
  );
}
