import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser, listBenefits } from "@/lib/data";
import { sql } from "@/lib/db";
import {
  CommunityView,
  type CommunityReview,
  type BuddyPost,
} from "@/components/CommunityView";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const t = await getTranslations("Community");

  const benefits = await listBenefits(locale);
  const titleById = new Map(benefits.map((b) => [b.id, b.title]));

  const reviewRows = (await sql`
    select id, rating, body, locale, translations, benefit_id
    from reviews order by created_at desc limit 30
  `) as {
    id: string;
    rating: number;
    body: string;
    locale: string;
    translations: Record<string, string> | null;
    benefit_id: string;
  }[];

  const reviews: CommunityReview[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    locale: r.locale,
    translations: r.translations ?? {},
    benefitId: r.benefit_id,
    benefitTitle: titleById.get(r.benefit_id) ?? "—",
  }));

  const buddyRows = (await sql`
    select id, title, body, when_at, benefit_id
    from buddy_posts where status = 'open'
    order by created_at desc limit 30
  `) as {
    id: string;
    title: string;
    body: string | null;
    when_at: string | null;
    benefit_id: string | null;
  }[];

  const buddyPosts: BuddyPost[] = buddyRows.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    when_at: p.when_at,
    benefitTitle: p.benefit_id ? (titleById.get(p.benefit_id) ?? null) : null,
  }));

  return (
    <main>
      <header className="border-b border-border px-4 py-3">
        <h1 className="text-lg font-bold">{t("title")}</h1>
      </header>
      <CommunityView
        reviews={reviews}
        buddyPosts={buddyPosts}
        benefitOptions={benefits.map((b) => ({ id: b.id, title: b.title }))}
      />
    </main>
  );
}
