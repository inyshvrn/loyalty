import Link from "next/link";
import { Check } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  {
    n: "1",
    title: "Daftar",
    body: "Nama, email, dan nomor HP — langsung dapat QR pribadi.",
  },
  {
    n: "2",
    title: "Scan tiap kunjungan",
    body: "Barista scan QR Anda saat checkout, maksimal satu kali sehari.",
  },
  {
    n: "3",
    title: "Klaim reward",
    body: "Capai jumlah stempel yang ditentukan, dapat produk gratis.",
  },
];

const trust = [
  "1 scan sama dengan 1 stempel",
  "Riwayat kunjungan tersimpan otomatis",
  "QR tetap ada walau ganti HP",
];

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border/70 bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
              Masuk
            </Button>
            <Button nativeButton={false} render={<Link href="/register" />}>
              Daftar
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-brand-50 to-background">
          <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center md:py-24">
            <div>
              <p className="mb-3 text-xs font-bold tracking-wide text-brand-700 uppercase">
                Loyalty digital
              </p>
              <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance text-foreground md:text-5xl">
                Kumpulkan stempel, dapat kopi gratis.
              </h1>
              <p className="mt-4 max-w-md text-base text-muted-foreground">
                Satu QR pribadi, dipindai tiap kunjungan. Tidak ada kartu
                kertas yang bisa hilang atau tertinggal.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
                  Daftar Sekarang
                </Button>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-foreground underline-offset-4 hover:underline"
                >
                  Sudah punya akun? Masuk
                </Link>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="w-56 rounded-2xl bg-gradient-to-br from-brand-700 to-brand-600 p-5 text-primary-foreground shadow-warm-lg">
                <p className="text-xs opacity-85">Kartu Sarah</p>
                <div
                  className="mx-auto my-4 size-28 rounded-lg bg-white/15"
                  style={{
                    backgroundImage:
                      "repeating-conic-gradient(rgba(255,255,255,.85) 0% 25%, transparent 0% 50%)",
                    backgroundSize: "10px 10px",
                  }}
                  aria-hidden
                />
                <div className="mb-1.5 flex justify-between text-[11px] opacity-90">
                  <span>6 dari 10 stempel</span>
                  <span>4 lagi</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < 6 ? "bg-reward-border" : "bg-white/25"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <Card key={step.n} className="p-5">
                <span className="mb-3 flex size-7 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-foreground">
                  {step.n}
                </span>
                <h3 className="mb-1 text-sm font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-[13px] text-muted-foreground">
                  {step.body}
                </p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-8 sm:flex-row sm:flex-wrap sm:gap-6">
            {trust.map((line) => (
              <div
                key={line}
                className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground"
              >
                <Check className="size-3.5 shrink-0 text-primary" />
                {line}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Handai Coffee</span>
          <span>&copy; {new Date().getFullYear()} Handai Coffee. Semua hak dilindungi.</span>
        </div>
      </footer>
    </div>
  );
}
