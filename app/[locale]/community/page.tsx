import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser, listBenefits } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
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
  const supabase = await createClient();

  const benefits = await listBenefits(locale);
  const titleById = new Map(benefits.map((b) => [b.id, b.title]));

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select("id, rating, body, locale, translations, benefit_id")
    .order("created_at", { ascending: false })
    .limit(30);

  const reviews: CommunityReview[] = (reviewRows ?? []).map((r) => ({
    id: r.id,
    rating: r.rating,
    body: r.body,
    locale: r.locale,
    translations: (r.translations as Record<string, string>) ?? {},
    benefitId: r.benefit_id,
    benefitTitle: titleById.get(r.benefit_id) ?? "—",
  }));

  const { data: buddyRows } = await supabase
    .from("buddy_posts")
    .select("id, title, body, when_at, benefit_id")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(30);

  const buddyPosts: BuddyPost[] = (buddyRows ?? []).map((p) => ({
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
