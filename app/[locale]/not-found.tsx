import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("Common");
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <div className="text-5xl">🤷</div>
        <p className="mt-3 text-muted">{t("error")}</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-brand px-5 py-2.5 font-semibold text-white"
        >
          {t("appName")}
        </Link>
      </div>
    </main>
  );
}
