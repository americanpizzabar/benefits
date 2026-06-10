import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SCENE_META } from "@/lib/scenes";
import { formatAmount } from "@/lib/currency";
import type { LocalizedBenefit } from "@/lib/data";

export function BenefitValue({
  benefit,
  currency,
}: {
  benefit: LocalizedBenefit;
  currency: string;
}) {
  const t = useTranslations("Benefit");
  if (benefit.amount != null) {
    return (
      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-ink">
        {t("save", { amount: formatAmount(benefit.amount, currency) })}
      </span>
    );
  }
  if (benefit.discount_pct != null) {
    return (
      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-ink">
        {t("off", { pct: benefit.discount_pct })}
      </span>
    );
  }
  return null;
}

export function BenefitCard({
  benefit,
  currency,
}: {
  benefit: LocalizedBenefit;
  currency: string;
}) {
  const meta = SCENE_META[benefit.scene];
  return (
    <Link
      href={`/benefit/${benefit.id}`}
      className="card flex items-center gap-3 p-3 active:scale-[0.99] transition-transform"
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${meta.gradient} text-2xl`}
      >
        {meta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{benefit.title}</p>
        {benefit.vendor && (
          <p className="truncate text-xs text-muted">{benefit.vendor}</p>
        )}
      </div>
      <BenefitValue benefit={benefit} currency={currency} />
    </Link>
  );
}
