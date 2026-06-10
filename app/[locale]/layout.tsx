import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { BottomNav } from "@/components/BottomNav";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyPerks — benefits that fit your life",
  description:
    "Discover and use your company benefits through the moments of your day.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "MyPerks", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#ff6a4d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={geist.variable}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="app-shell pb-24">{children}</div>
          <BottomNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
