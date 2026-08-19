import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Masuk</CardTitle>
        <CardDescription>
          Satu form untuk pelanggan, barista, dan admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <LoginForm />
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
