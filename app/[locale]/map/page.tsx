import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser, listBenefits } from "@/lib/data";
import { MapClient } from "@/components/MapClient";
import type { MapPoint } from "@/components/LeafletMap";

export default async function MapPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const { locale } = await params;
  const { focus } = await searchParams;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const t = await getTranslations("Map");
  const benefits = await listBenefits(locale);
  const points: MapPoint[] = benefits
    .filter((b) => b.lat != null && b.lng != null)
    .map((b) => ({
      id: b.id,
      title: b.title,
      vendor: b.vendor,
      lat: b.lat as number,
      lng: b.lng as number,
    }));

  return (
    <main>
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold">{t("title")}</h1>
        <p className="text-xs text-muted">{t("intro")}</p>
      </header>
      <MapClient points={points} focusId={focus} />
    </main>
  );
}
