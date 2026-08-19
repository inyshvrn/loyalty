import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Daftar</CardTitle>
        <CardDescription>
          Dapatkan QR pribadi untuk mulai mengumpulkan stempel.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RegisterForm />
        <p className="text-center text-[13px] text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Masuk
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
