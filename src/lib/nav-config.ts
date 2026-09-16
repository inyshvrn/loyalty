import type { LucideIcon } from "lucide-react";
import {
  Home,
  QrCode,
  History,
  Users,
  User,
  Settings,
  Store,
  ClipboardCheck,
  Camera,
  Search,
  CircleUserRound,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Small count pill shown after the label — set per-render (e.g. pending
   * approvals), not part of the static nav definition below. */
  badge?: number;
};

export const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Kartu", icon: QrCode },
  { href: "/history", label: "Riwayat", icon: History },
];

export const baristaNav: NavItem[] = [
  { href: "/scan", label: "Scan QR", icon: Camera },
  { href: "/scan/cari", label: "Cari Manual", icon: Search },
  { href: "/scan/akun", label: "Akun", icon: CircleUserRound },
];

export const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/customers", label: "Pelanggan", icon: Users },
  { href: "/admin/baristas", label: "Barista", icon: User },
  { href: "/admin/outlets", label: "Outlet", icon: Store },
  { href: "/admin/stamp-requests", label: "Persetujuan", icon: ClipboardCheck },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];
