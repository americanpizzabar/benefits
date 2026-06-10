import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { getUser, getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { formatJPY } from "@/lib/currency";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { CurrencySelect, SignOutButton } from "@/components/ProfileSettings";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const profile = await getProfile();
  const t = await getTranslations("Profile");
  const tw = await getTranslations("Wallet");

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("savings_log")
    .select("amount_saved")
    .eq("user_id", user!.id);
  const totalSaved = (logs ?? []).reduce((s, e) => s + e.amount_saved, 0);

  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-bold">{t("title")}</h1>

      <section className="mt-4 card flex items-center gap-3 p-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-brand/15 text-2xl">
          {profile?.display_name?.[0]?.toUpperCase() ?? "👤"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {profile?.display_name ?? user!.email}
          </p>
          <p className="text-xs text-muted">
            {profile?.is_admin ? t("admin") : t("member")}
          </p>
        </div>
      </section>

      <p className="mt-3 text-sm text-muted">
        {t("savedSoFar", { amount: formatJPY(totalSaved) })}
      </p>

      <section className="mt-5 card divide-y divide-border">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium">{t("language")}</span>
          <LocaleSwitch />
        </div>
        <div className="p-4">
          <CurrencySelect value={profile?.currency ?? "JPY"} />
        </div>
      </section>

      <section className="mt-5 space-y-2">
        <Link
          href="/wallet"
          className="card flex items-center justify-between p-4 text-sm font-medium"
        >
          👛 {tw("title")}
          <span className="text-muted">›</span>
        </Link>
        <Link
          href="/onboarding"
          className="card flex items-center justify-between p-4 text-sm font-medium"
        >
          🎚️ {t("editLifestyle")}
          <span className="text-muted">›</span>
        </Link>
        {profile?.is_admin && (
          <Link
            href="/admin"
            className="card flex items-center justify-between p-4 text-sm font-medium"
          >
            🛠️ {t("admin")}
            <span className="text-muted">›</span>
          </Link>
        )}
      </section>

      <div className="mt-5 pb-6">
        <SignOutButton />
      </div>
    </main>
  );
}
