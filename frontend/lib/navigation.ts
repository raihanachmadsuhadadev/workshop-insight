import {
  BarChart3,
  Boxes,
  ClipboardList,
  FileBarChart,
  Gauge,
  PackageSearch,
  ReceiptText,
  Settings,
  Sparkles,
  UserRoundCog,
  UsersRound,
  Wrench,
} from "lucide-react";

export const adminNavigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: Gauge },
  { label: "Transaksi", href: "/admin/transactions", icon: ReceiptText },
  { label: "Suku Cadang", href: "/admin/spare-parts", icon: Boxes },
  { label: "Layanan Servis", href: "/admin/services", icon: Wrench },
  { label: "Pelanggan", href: "/admin/customers", icon: UsersRound },
  { label: "Mekanik", href: "/admin/mechanics", icon: UserRoundCog },
  { label: "Stok", href: "/admin/stocks", icon: PackageSearch },
  { label: "Laporan", href: "/admin/reports", icon: FileBarChart },
];

export const ownerNavigation = [
  { label: "Dashboard", href: "/owner/dashboard", icon: Gauge },
  { label: "Analisis Apriori", href: "/owner/apriori", icon: BarChart3 },
  { label: "Hasil Analisis", href: "/owner/apriori-results", icon: ClipboardList },
  { label: "Rekomendasi Paket", href: "/owner/recommendations", icon: Sparkles },
  { label: "Laporan", href: "/owner/reports", icon: FileBarChart },
  { label: "Pengaturan", href: "/owner/settings", icon: Settings },
];
