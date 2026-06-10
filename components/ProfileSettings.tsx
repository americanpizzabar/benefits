"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateProfile, signOut } from "@/lib/actions";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";

export function CurrencySelect({ value }: { value: string }) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [currency, setCurrency] = useState(value);
  const [, start] = useTransition();

  return (
    <label className="flex items-center justify-between">
      <span className="text-sm font-medium">{t("currency")}</span>
      <select
        value={currency}
        onChange={(e) => {
          const next = e.target.value;
          setCurrency(next);
          start(async () => {
            await updateProfile({ currency: next });
            router.refresh();
          });
        }}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
      >
        {SUPPORTED_CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SignOutButton() {
  const t = useTranslations("Common");
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() =>
        start(async () => {
          await signOut();
          router.replace("/sign-in");
          router.refresh();
        })
      }
      disabled={pending}
      className="w-full rounded-xl border border-border py-3 text-sm font-semibold text-red-600 disabled:opacity-50"
    >
      {t("signOut")}
    </button>
  );
}
