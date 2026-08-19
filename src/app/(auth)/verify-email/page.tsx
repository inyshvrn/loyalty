import Link from "next/link";
import { MailCheck, CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export default async function VerifyEmailPage(
  props: PageProps<"/verify-email">
) {
  const searchParams = await props.searchParams;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const email = typeof searchParams.email === "string" ? searchParams.email : undefined;

  if (status === "success") {
    return (
      <Card>
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-accent">
            <CircleCheck className="size-5 text-accent-foreground" />
          </span>
          <CardTitle className="text-xl">Email berhasil diverifikasi</CardTitle>
          <CardDescription>
            Akun Anda sudah aktif. Silakan masuk untuk melanjutkan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" type="button" nativeButton={false} render={<Link href="/login" />}>
            Masuk
          </Button>
        </CardContent>
      </Card>
    );
  }

  const linkIsInvalid = status === "invalid" || status === "missing";

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-accent">
          <MailCheck className="size-5 text-accent-foreground" />
        </span>
        <CardTitle className="text-xl">
          {linkIsInvalid ? "Tautan tidak valid" : "Periksa email Anda"}
        </CardTitle>
        <CardDescription>
          {linkIsInvalid
            ? "Tautan verifikasi tidak valid atau sudah kedaluwarsa. Masukkan email Anda untuk mengirim tautan baru."
            : "Kami mengirim tautan verifikasi ke email yang Anda daftarkan. Buka tautan itu untuk mengaktifkan akun sebelum masuk."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <ResendVerificationForm defaultEmail={email} />
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
