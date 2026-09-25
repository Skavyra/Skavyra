"use client";

import {
  Award,
  BarChart3,
  BookOpen,
  CreditCard,
  FileSignature,
  GraduationCap,
  LayoutDashboard,
  type LucideIcon,
  PhoneCall,
  Settings,
  TrendingUp,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import type { NavIconName, NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<NavIconName, LucideIcon> = {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Award,
  User,
  PhoneCall,
  UserPlus,
  TrendingUp,
  Users,
  GraduationCap,
  FileSignature,
  BarChart3,
  Settings,
};

export function isActive(pathname: string, href: string, items: NavItem[]) {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;
  // a longer item in the same panel is the better match (e.g. /leads vs /leads/new)
  return !items.some((i) => i.href !== href && i.href.length > href.length && (pathname === i.href || pathname.startsWith(`${i.href}/`)));
}

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel" className="flex flex-col gap-1">
      {items.map(({ href, label, icon }) => {
        const active = isActive(pathname, href, items);
        const Icon = ICONS[icon];
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
              active ? "bg-gold-300 text-ink" : "text-ivory/70 hover:bg-charcoal hover:text-ivory",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  return (
    <aside className="theme-ink hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-background p-4 text-foreground lg:flex">
      <div className="px-2 pt-2">
        <Logo />
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold-300">{title}</p>
      </div>
      <SidebarNav items={items} />
    </aside>
  );
}
