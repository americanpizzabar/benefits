import "server-only";
import { createClient } from "@/lib/supabase/server";
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

/** Current authenticated user (or null). */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The current user's profile row (or null if signed out). */
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}

export function getLifestyle(profile: { lifestyle: unknown } | null): Lifestyle {
  return (profile?.lifestyle as Lifestyle) ?? {};
}

/** All published benefits, localized, optionally filtered by scene. */
export async function listBenefits(
  locale: string,
  scene?: string,
): Promise<LocalizedBenefit[]> {
  const supabase = await createClient();
  let query = supabase
    .from("benefits")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  if (scene) query = query.eq("scene", scene as Benefit["scene"]);

  const { data: benefits } = await query;
  if (!benefits || benefits.length === 0) return [];

  const { data: translations } = await supabase
    .from("benefit_translations")
    .select("*")
    .eq("locale", locale)
    .in(
      "benefit_id",
      benefits.map((b) => b.id),
    );

  const byId = new Map((translations ?? []).map((t) => [t.benefit_id, t]));
  return benefits.map((b) => applyTranslation(b, byId.get(b.id), locale));
}

/** A single benefit, localized. */
export async function getBenefit(
  id: string,
  locale: string,
): Promise<LocalizedBenefit | null> {
  const supabase = await createClient();
  const { data: benefit } = await supabase
    .from("benefits")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!benefit) return null;

  const { data: tr } = await supabase
    .from("benefit_translations")
    .select("*")
    .eq("benefit_id", id)
    .eq("locale", locale)
    .maybeSingle();

  return applyTranslation(benefit, tr ?? undefined, locale);
}
