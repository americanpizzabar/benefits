import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getUser } from "@/lib/data";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) redirect({ href: "/sign-in", locale });

  return <OnboardingFlow />;
}
