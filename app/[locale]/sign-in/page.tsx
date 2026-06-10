import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/data";
import { SignInForm } from "@/components/SignInForm";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (user) redirect({ href: "/", locale });

  const t = await getTranslations("Auth");
  const tc = await getTranslations("Common");

  return (
    <main className="px-5 pt-16">
      <div className="mb-8 text-center">
        <div className="text-5xl">🎁</div>
        <h1 className="mt-3 text-2xl font-bold">
          {t("signInTitle", { appName: tc("appName") })}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("intro")}</p>
      </div>
      <SignInForm />
    </main>
  );
}
