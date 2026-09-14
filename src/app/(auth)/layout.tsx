import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { BrandWatermark } from "@/components/brand-watermark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-5 py-12">
      <BrandWatermark className="-top-24 -right-24 size-96 bg-brand-600/5" />
      <BrandWatermark className="-bottom-28 -left-28 size-96 bg-brand-600/5" />
      <Link href="/" className="relative z-10 mb-8">
        <BrandMark />
      </Link>
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
