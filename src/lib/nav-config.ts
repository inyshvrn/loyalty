import type { LucideIcon } from "lucide-react";
import { Home, QrCode, History, Users, User, Settings } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Kartu", icon: QrCode },
  { href: "/history", label: "Riwayat", icon: History },
];

export const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/customers", label: "Pelanggan", icon: Users },
  { href: "/admin/baristas", label: "Barista", icon: User },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];
