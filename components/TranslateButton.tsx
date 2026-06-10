"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

/** Generate an AI translation + context tip for a benefit on demand. */
export function TranslateButton({ benefitId }: { benefitId: string }) {
  const t = useTranslations("Benefit");
  const locale = useLocale();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function run() {
    setPending(true);
    setError(false);
    const res = await fetch(
      `/api/benefits/${benefitId}/translate?locale=${locale}`,
      { method: "POST" },
    );
    setPending(false);
    if (res.ok) router.refresh();
    else setError(true);
  }

  return (
    <button
      onClick={run}
      disabled={pending}
      className="text-xs font-medium text-brand disabled:opacity-50"
    >
      🌐 {pending ? "…" : t("machineTranslated")}
      {error && <span className="ml-1 text-red-500">!</span>}
    </button>
  );
}
