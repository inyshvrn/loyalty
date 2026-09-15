import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { FormMessage } from "@/components/auth/form-message";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const resetSuccess = searchParams.reset === "success";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Masuk</CardTitle>
        <CardDescription>
          Satu form untuk pelanggan, barista, dan admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {resetSuccess && (
          <FormMessage success="Kata sandi berhasil diatur ulang. Silakan masuk dengan kata sandi baru." />
        )}
        <LoginForm />
        <p className="text-center text-[13px] text-muted-foreground">
          <Link href="/forgot-password" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Lupa kata sandi?
          </Link>
        </p>
        <p className="text-center text-[13px] text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Daftar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}