import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Lupa Kata Sandi</CardTitle>
        <CardDescription>
          Masukkan email akun Anda — kami kirimkan tautan buat atur ulang kata
          sandi.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ForgotPasswordForm />
        <p className="text-center text-[13px] text-muted-foreground">
          <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Kembali ke halaman masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
