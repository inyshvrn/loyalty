import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-accent">
          <MailCheck className="size-5 text-accent-foreground" />
        </span>
        <CardTitle className="text-xl">Periksa email Anda</CardTitle>
        <CardDescription>
          Kami mengirim tautan verifikasi ke email yang Anda daftarkan. Buka
          tautan itu untuk mengaktifkan akun sebelum masuk.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <Button variant="outline" type="button" className="w-full">
          Kirim Ulang Email
        </Button>
        <Link
          href="/login"
          className="text-[13px] font-semibold text-foreground underline-offset-4 hover:underline"
        >
          Kembali ke halaman masuk
        </Link>
      </CardContent>
    </Card>
  );
}
