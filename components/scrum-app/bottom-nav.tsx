"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Dumbbell,
  Users,
  Video,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: typeof Dumbbell;
};

const navItems: NavItem[] = [
  { label: "Exercises", href: "/", icon: Dumbbell },
  { label: "Sessions", href: "/sessions", icon: Calendar },
  { label: "Positions", href: "/positions", icon: Users },
  { label: "Live", href: "/live", icon: Video },
  { label: "Principles", href: "/principles", icon: BookOpen },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname === ""
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe"
      aria-label="Main"
    >
      <div className="flex h-16 items-stretch justify-between gap-0.5 px-1 sm:gap-1 sm:px-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 transition-colors sm:gap-1 ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5 shrink-0" aria-hidden />
              <span className="text-center text-[9px] font-medium leading-tight sm:text-[10px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
