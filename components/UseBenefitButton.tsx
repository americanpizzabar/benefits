"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { logBenefitUse } from "@/lib/actions";
import { formatJPY } from "@/lib/currency";

export function UseBenefitButton({
  benefitId,
  defaultAmount,
}: {
  benefitId: string;
  defaultAmount: number;
}) {
  const t = useTranslations("Benefit");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(defaultAmount);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    await logBenefitUse(benefitId, amount);
    setPending(false);
    setDone(true);
    setOpen(false);
    router.refresh();
  }

  if (done) {
    return (
      <div className="animate-pop rounded-xl bg-emerald-50 py-3 text-center font-semibold text-emerald-700">
        ✅ {t("logged", { amount: formatJPY(amount) })}
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl bg-brand py-3 font-semibold text-white"
      >
        {t("useThis")}
      </button>
    );
  }

  return (
    <div className="card space-y-3 p-3">
      <label className="text-sm font-medium" htmlFor="saved">
        {t("save", { amount: "" })}
      </label>
      <div className="flex items-center gap-2">
        <span className="text-muted">¥</span>
        <input
          id="saved"
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full rounded-lg border border-border px-3 py-2"
        />
      </div>
      <button
        onClick={confirm}
        disabled={pending}
        className="w-full rounded-xl bg-brand py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {t("useThis")}
      </button>
    </div>
  );
}
