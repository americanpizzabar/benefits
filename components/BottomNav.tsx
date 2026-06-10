"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TABS = [
  { href: "/", key: "home", icon: "🏠" },
  { href: "/map", key: "map", icon: "📍" },
  { href: "/tracker", key: "tracker", icon: "📈" },
  { href: "/community", key: "community", icon: "💬" },
  { href: "/profile", key: "profile", icon: "👤" },
] as const;

// Routes where the tab bar should be hidden.
const HIDDEN_PREFIXES = ["/sign-in", "/onboarding", "/auth"];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("Nav");

  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[30rem] border-t border-border bg-surface/95 backdrop-blur">
      <ul className="grid grid-cols-5">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                {t(tab.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
