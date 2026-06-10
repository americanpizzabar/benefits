import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/data";
import { PageHeader } from "@/components/PageHeader";
import { WalletView } from "@/components/WalletView";

export default async function WalletPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  const t = await getTranslations("Wallet");
  return (
    <main>
      <PageHeader title={t("title")} backHref="/profile" />
      <WalletView />
    </main>
  );
}
