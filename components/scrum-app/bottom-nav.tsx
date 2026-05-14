"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Calendar, Dumbbell, Users } from "lucide-react";

const navItems = [
  { label: "Exercises", href: "/", icon: Dumbbell },
  { label: "Sessions", href: "/sessions", icon: Calendar },
  { label: "Positions", href: "/positions", icon: Users },
  { label: "Principles", href: "/principles", icon: BookOpen },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe"
      aria-label="Main"
    >
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === ""
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={`flex h-full w-full flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-5" aria-hidden />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
