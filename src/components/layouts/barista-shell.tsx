import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";
import { Badge } from "@/components/ui/badge";

export function BaristaShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-6">
        <BrandMark />
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-semibold">
            Barista
          </Badge>
          <UserMenu name={user.name} email={user.email} />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
