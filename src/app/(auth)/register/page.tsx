import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nama lengkap</Label>
          <Input id="name" placeholder="Sarah Wijaya" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Nomor HP</Label>
          <Input id="phone" type="tel" placeholder="08xx xxxx xxxx" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Kata sandi</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button className="mt-1" type="button">
          Daftar Sekarang
        </Button>
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
