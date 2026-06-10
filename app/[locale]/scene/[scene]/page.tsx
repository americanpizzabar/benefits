import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isScene, SCENE_META } from "@/lib/scenes";
import { getProfile, listBenefits } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { BenefitCard } from "@/components/BenefitCard";

export default async function ScenePage({
  params,
}: {
  params: Promise<{ locale: string; scene: string }>;
}) {
  const { locale, scene } = await params;
  setRequestLocale(locale);
  if (!isScene(scene)) notFound();

  const t = await getTranslations("Scenes");
  const profile = await getProfile();
  const currency = profile?.currency ?? "JPY";
  const benefits = await listBenefits(locale, scene);

  return (
    <main>
      <PageHeader title={`${SCENE_META[scene].emoji} ${t(scene)}`} />
      <div className="space-y-2 px-4 py-4">
        {benefits.map((benefit) => (
          <BenefitCard
            key={benefit.id}
            benefit={benefit}
            currency={currency}
          />
        ))}
      </div>
    </main>
  );
}
