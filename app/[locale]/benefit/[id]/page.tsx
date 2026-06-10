import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getBenefit, getProfile } from "@/lib/data";
import { sql } from "@/lib/db";
import { estimateSaving } from "@/lib/savings";
import { SCENE_META } from "@/lib/scenes";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/PageHeader";
import { BenefitValue } from "@/components/BenefitCard";
import { UseBenefitButton } from "@/components/UseBenefitButton";
import { AddToWalletButton } from "@/components/AddToWalletButton";
import { ReviewsSection, type ReviewItem } from "@/components/ReviewsSection";
import { TranslateButton } from "@/components/TranslateButton";

export default async function BenefitPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const benefit = await getBenefit(id, locale);
  if (!benefit) notFound();

  const profile = await getProfile();
  const currency = profile?.currency ?? "JPY";
  const t = await getTranslations("Benefit");
  const meta = SCENE_META[benefit.scene];

  const reviewRows = (await sql`
    select id, rating, body, locale, translations
    from reviews where benefit_id = ${id}
    order by created_at desc
  `) as {
    id: string;
    rating: number;
    body: string;
    locale: string;
    translations: Record<string, string> | null;
  }[];

  const reviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    locale: r.locale,
    translations: r.translations ?? {},
  }));

  return (
    <main className="pb-10">
      <PageHeader title={benefit.title} backHref={`/scene/${benefit.scene}`} />

      <div
        className={`bg-gradient-to-br ${meta.gradient} px-5 py-6 text-white`}
      >
        <div className="flex items-center justify-between">
          <span className="text-4xl">{meta.emoji}</span>
          <BenefitValue benefit={benefit} currency={currency} />
        </div>
        <h1 className="mt-3 text-2xl font-bold leading-tight">
          {benefit.title}
        </h1>
        {benefit.vendor && (
          <p className="mt-1 text-sm text-white/90">
            {t("vendor")}: {benefit.vendor}
          </p>
        )}
      </div>

      <div className="space-y-5 px-4 py-5">
        {benefit.translated && (
          <p className="text-xs text-muted">🌐 {t("machineTranslated")}</p>
        )}
        {!benefit.translated && locale !== benefit.base_locale && (
          <TranslateButton benefitId={benefit.id} />
        )}

        {benefit.action && (
          <div className="card p-4">
            <p className="text-sm font-semibold">{benefit.action}</p>
          </div>
        )}

        {benefit.details && (
          <div>
            <h2 className="mb-1 text-sm font-semibold text-muted">
              {t("details")}
            </h2>
            <p className="text-sm leading-relaxed">{benefit.details}</p>
          </div>
        )}

        {benefit.context_tip && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-800">
              💡 {t("contextTip")}
            </p>
            <p className="mt-1 text-sm text-amber-900">{benefit.context_tip}</p>
          </div>
        )}

        <div className="space-y-2">
          <UseBenefitButton
            benefitId={benefit.id}
            defaultAmount={estimateSaving(benefit)}
          />
          <AddToWalletButton
            item={{
              id: benefit.id,
              title: benefit.title,
              vendor: benefit.vendor,
            }}
          />
          {benefit.lat != null && benefit.lng != null && (
            <Link
              href={`/map?focus=${benefit.id}`}
              className="block w-full rounded-xl border border-border bg-surface py-3 text-center font-semibold"
            >
              📍 {t("viewOnMap")}
            </Link>
          )}
        </div>

        <ReviewsSection benefitId={benefit.id} reviews={reviews} />
      </div>
    </main>
  );
}
