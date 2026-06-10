"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { completeOnboarding } from "@/lib/actions";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import type { Lifestyle } from "@/lib/suggest";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-brand bg-brand text-white"
          : "border-border bg-surface text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function OnboardingFlow() {
  const t = useTranslations("Onboarding");
  const initialLocale = useLocale();
  const router = useRouter();

  const [dining, setDining] = useState<Lifestyle["dining"]>();
  const [activity, setActivity] = useState<Lifestyle["activity"]>();
  const [family, setFamily] = useState<Lifestyle["family"]>();
  const [locale, setLocale] = useState(initialLocale);
  const [currency, setCurrency] = useState("JPY");
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    await completeOnboarding({
      lifestyle: { dining, activity, family },
      locale,
      currency,
    });
    router.replace("/", { locale });
    router.refresh();
  }

  return (
    <main className="px-5 pb-32 pt-10">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted">{t("intro")}</p>

      <section className="mt-7">
        <h2 className="mb-2 font-semibold">{t("diningQ")}</h2>
        <div className="flex flex-wrap gap-2">
          <Chip active={dining === "eat_out"} onClick={() => setDining("eat_out")}>
            🍽️ {t("dining_eat_out")}
          </Chip>
          <Chip active={dining === "cook"} onClick={() => setDining("cook")}>
            🍳 {t("dining_cook")}
          </Chip>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 font-semibold">{t("activityQ")}</h2>
        <div className="flex flex-wrap gap-2">
          <Chip
            active={activity === "indoor"}
            onClick={() => setActivity("indoor")}
          >
            🛋️ {t("activity_indoor")}
          </Chip>
          <Chip
            active={activity === "outdoor"}
            onClick={() => setActivity("outdoor")}
          >
            🏞️ {t("activity_outdoor")}
          </Chip>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 font-semibold">{t("familyQ")}</h2>
        <div className="flex flex-wrap gap-2">
          <Chip active={family === "single"} onClick={() => setFamily("single")}>
            🙋 {t("family_single")}
          </Chip>
          <Chip active={family === "couple"} onClick={() => setFamily("couple")}>
            💑 {t("family_couple")}
          </Chip>
          <Chip active={family === "kids"} onClick={() => setFamily("kids")}>
            👨‍👩‍👧 {t("family_kids")}
          </Chip>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h2 className="mb-2 font-semibold">{t("languageQ")}</h2>
          <div className="flex gap-2">
            <Chip active={locale === "en"} onClick={() => setLocale("en")}>
              EN
            </Chip>
            <Chip active={locale === "ja"} onClick={() => setLocale("ja")}>
              日本語
            </Chip>
          </div>
        </div>
        <div>
          <h2 className="mb-2 font-semibold">{t("currencyQ")}</h2>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2"
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[30rem] border-t border-border bg-surface/95 p-4 backdrop-blur">
        <button
          onClick={finish}
          disabled={saving}
          className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
        >
          {t("finish")}
        </button>
      </div>
    </main>
  );
}
