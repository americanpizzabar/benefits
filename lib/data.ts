import "server-only";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import type { Tables } from "@/lib/database.types";
import type { Lifestyle } from "@/lib/suggest";

export type Benefit = Tables<"benefits">;

/** A benefit with its user-facing copy resolved for a specific locale. */
export type LocalizedBenefit = Benefit & {
  context_tip: string | null;
  /** true when the displayed copy came from an AI/seed translation row. */
  translated: boolean;
};

type TranslationRow = Tables<"benefit_translations">;

/** The current user's profile (the Neon `users` row, minus the password). */
export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  locale: string;
  currency: string;
  lifestyle: unknown;
  home_area: string | null;
  onboarded: boolean;
  is_admin: boolean;
};

function applyTranslation(
  benefit: Benefit,
  tr: TranslationRow | undefined,
  locale: string,
): LocalizedBenefit {
  // Base locale (or missing translation) → use the benefit's own fields.
  if (!tr || locale === benefit.base_locale) {
    return { ...benefit, context_tip: tr?.context_tip ?? null, translated: false };
  }
  return {
    ...benefit,
    title: tr.title ?? benefit.title,
    action: tr.action ?? benefit.action,
    details: tr.details ?? benefit.details,
    context_tip: tr.context_tip ?? null,
    translated: true,
  };
}

/** Current authenticated user (id + email + admin flag), or null. */
export async function getUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    isAdmin: session.user.isAdmin ?? false,
  };
}

/** The current user's profile row (or null if signed out). */
export async function getProfile(): Promise<Profile | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const rows = (await sql`
    select id, email, display_name, locale, currency, lifestyle,
           home_area, onboarded, is_admin
    from users where id = ${session.user.id} limit 1
  `) as Profile[];
  return rows[0] ?? null;
}

export function getLifestyle(profile: { lifestyle: unknown } | null): Lifestyle {
  return (profile?.lifestyle as Lifestyle) ?? {};
}

/** All published benefits, localized, optionally filtered by scene. */
export async function listBenefits(
  locale: string,
  scene?: string,
): Promise<LocalizedBenefit[]> {
  const benefits = (
    scene
      ? await sql`
          select * from benefits
          where published = true and scene = ${scene}::scene
          order by created_at asc`
      : await sql`
          select * from benefits
          where published = true
          order by created_at asc`
  ) as Benefit[];

  if (benefits.length === 0) return [];

  // The translations table is small, so fetch the locale's rows and match in
  // JS (avoids passing an array parameter over the Neon HTTP driver).
  const ids = new Set(benefits.map((b) => b.id));
  const allTranslations = (await sql`
    select * from benefit_translations where locale = ${locale}
  `) as TranslationRow[];
  const translations = allTranslations.filter((t) => ids.has(t.benefit_id));

  const byId = new Map(translations.map((t) => [t.benefit_id, t]));
  return benefits.map((b) => applyTranslation(b, byId.get(b.id), locale));
}

/** A single benefit, localized. */
export async function getBenefit(
  id: string,
  locale: string,
): Promise<LocalizedBenefit | null> {
  const benefits = (await sql`
    select * from benefits where id = ${id} limit 1
  `) as Benefit[];
  const benefit = benefits[0];
  if (!benefit) return null;

  const translations = (await sql`
    select * from benefit_translations
    where benefit_id = ${id} and locale = ${locale} limit 1
  `) as TranslationRow[];

  return applyTranslation(benefit, translations[0], locale);
}
