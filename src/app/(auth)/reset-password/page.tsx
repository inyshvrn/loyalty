import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage(
  props: PageProps<"/reset-password">
) {
  const searchParams = await props.searchParams;
  const token = typeof searchParams.token === "string" ? searchParams.token : "";

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tautan tidak valid</CardTitle>
          <CardDescription>
            Tautan atur ulang kata sandi tidak lengkap. Minta tautan baru dari
            halaman lupa kata sandi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/forgot-password"
            className="text-[13px] font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Minta tautan baru
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Atur Ulang Kata Sandi</CardTitle>
        <CardDescription>Buat kata sandi baru untuk akun Anda.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ResetPasswordForm token={token} />
      </CardContent>
    </Card>
  );
}
