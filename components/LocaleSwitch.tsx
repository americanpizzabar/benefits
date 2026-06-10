"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LABELS: Record<string, string> = { en: "EN", ja: "日本語" };

/** Toggle the active locale while preserving the current path. */
export function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-0.5 text-xs font-medium">
      {(["en", "ja"] as const).map((l) => (
        <button
          key={l}
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded-full px-2.5 py-1 ${
            l === locale ? "bg-brand text-white" : "text-muted"
          }`}
          aria-pressed={l === locale}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
