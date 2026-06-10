import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatJPY } from "@/lib/currency";
import { SCENE_META, type Scene } from "@/lib/scenes";
import { SavedCounter } from "@/components/SavedCounter";

export default async function TrackerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const t = await getTranslations("Tracker");
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("savings_log")
    .select("amount_saved, used_at, benefits(title, scene)")
    .eq("user_id", user!.id)
    .order("used_at", { ascending: false });

  const entries = logs ?? [];
  const now = new Date();
  const monthSaved = entries
    .filter((e) => {
      const d = new Date(e.used_at);
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, e) => s + e.amount_saved, 0);
  const totalSaved = entries.reduce((s, e) => s + e.amount_saved, 0);

  // Last 6 months buckets for the bar chart.
  const months: { label: string; total: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const total = entries
      .filter((e) => {
        const ed = new Date(e.used_at);
        return (
          ed.getMonth() === d.getMonth() &&
          ed.getFullYear() === d.getFullYear()
        );
      })
      .reduce((s, e) => s + e.amount_saved, 0);
    months.push({
      label: d.toLocaleDateString(locale, { month: "short" }),
      total,
    });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));

  const { data: allBadges } = await supabase
    .from("badges")
    .select("*")
    .order("sort_order");
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("badge_code")
    .eq("user_id", user!.id);
  const unlocked = new Set((userBadges ?? []).map((b) => b.badge_code));

  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <section className="mt-4 rounded-2xl bg-gradient-to-br from-brand to-rose-400 p-5 text-white">
        <p className="text-sm text-white/90">{t("savedThisMonth")}</p>
        <p className="mt-1 text-4xl font-extrabold">
          <SavedCounter value={monthSaved} />
        </p>
        <p className="mt-2 text-sm text-white/90">
          {t("savedTotal")}: {formatJPY(totalSaved)} ·{" "}
          {t("timesUsed", { count: entries.length })}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">
          {t("byMonth")}
        </h2>
        <div className="card flex items-end justify-between gap-2 p-4">
          {months.map((m, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-brand/80"
                style={{ height: `${Math.round((m.total / maxMonth) * 80) + 4}px` }}
                title={formatJPY(m.total)}
              />
              <span className="text-[10px] text-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">{t("badges")}</h2>
        <div className="grid grid-cols-3 gap-3">
          {(allBadges ?? []).map((badge) => {
            const has = unlocked.has(badge.code);
            return (
              <div
                key={badge.code}
                className={`card flex flex-col items-center p-3 text-center ${
                  has ? "" : "opacity-45 grayscale"
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="mt-1 text-xs font-semibold leading-tight">
                  {badge.name}
                </span>
                {!has && (
                  <span className="mt-0.5 text-[10px] text-muted">
                    {t("locked")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 pb-6">
        <h2 className="mb-2 text-sm font-semibold text-muted">{t("recent")}</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">{t("noActivity")}</p>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 12).map((e, i) => {
              const benefit = e.benefits as {
                title: string;
                scene: Scene;
              } | null;
              return (
                <div
                  key={i}
                  className="card flex items-center gap-3 p-3"
                >
                  <span className="text-xl">
                    {benefit ? SCENE_META[benefit.scene].emoji : "✨"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {benefit?.title ?? "—"}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(e.used_at).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-ink">
                    +{formatJPY(e.amount_saved)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
