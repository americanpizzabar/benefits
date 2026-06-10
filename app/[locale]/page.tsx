import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { getUser, getProfile, getLifestyle, listBenefits } from "@/lib/data";
import { todaysPick, rankForUser } from "@/lib/suggest";
import { SCENES, SCENE_META } from "@/lib/scenes";
import { SceneTile } from "@/components/SceneTile";
import { BenefitCard, BenefitValue } from "@/components/BenefitCard";
import { LocaleSwitch } from "@/components/LocaleSwitch";

const REASON_KEY: Record<string, string> = {
  lunch: "reasonLunch",
  weekend: "reasonWeekend",
  evening: "reasonEvening",
  morning: "reasonMorning",
  default: "reasonDefault",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const profile = await getProfile();
  if (!profile || !profile.onboarded) redirect({ href: "/onboarding", locale });

  const t = await getTranslations("Home");
  const lifestyle = getLifestyle(profile);
  const currency = profile?.currency ?? "JPY";

  const benefits = await listBenefits(locale);
  const pick = todaysPick(benefits, lifestyle);
  const ranked = rankForUser(benefits, lifestyle).slice(0, 6);

  return (
    <main className="px-4 pt-5">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted">
            {profile?.display_name
              ? t("greeting", { name: profile.display_name })
              : t("greetingGuest")}
          </p>
          <h1 className="text-2xl font-bold">{t("subtitle")}</h1>
        </div>
        <LocaleSwitch />
      </header>

      {pick && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-muted">
            {t("todaysPick")}
          </h2>
          <Link
            href={`/benefit/${pick.benefit.id}`}
            className={`block overflow-hidden rounded-2xl bg-gradient-to-br ${SCENE_META[pick.benefit.scene].gradient} p-5 text-white active:scale-[0.99] transition-transform`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">
                {SCENE_META[pick.benefit.scene].emoji}
              </span>
              <BenefitValue benefit={pick.benefit} currency={currency} />
            </div>
            <p className="mt-3 text-xl font-bold leading-tight">
              {pick.benefit.title}
            </p>
            <p className="mt-1 text-sm text-white/90">
              {t(REASON_KEY[pick.reasonKey] ?? "reasonDefault")}
            </p>
          </Link>
        </section>
      )}

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-semibold text-muted">
          {t("browseByScene")}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {SCENES.map((scene) => (
            <SceneTile key={scene} scene={scene} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">
          {t("recommended")}
        </h2>
        <div className="space-y-2">
          {ranked.map((benefit) => (
            <BenefitCard
              key={benefit.id}
              benefit={benefit}
              currency={currency}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
