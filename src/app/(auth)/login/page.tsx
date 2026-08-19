import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="nama@email.com" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Kata sandi</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button className="mt-1" type="button">
          Masuk
        </Button>
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
