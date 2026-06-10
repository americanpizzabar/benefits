"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { evaluateBadges, type UsageEntry } from "@/lib/savings";
import { translateText } from "@/lib/ai/anthropic";
import type { Scene } from "@/lib/scenes";
import type { Lifestyle } from "@/lib/suggest";

/** Log a use of a benefit and unlock any newly-earned badges. */
export async function logBenefitUse(benefitId: string, amount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" as const };

  const { error } = await supabase.from("savings_log").insert({
    user_id: user.id,
    benefit_id: benefitId,
    amount_saved: Math.max(0, Math.round(amount)),
  });
  if (error) return { error: error.message };

  // Re-evaluate badges from full history.
  const { data: logs } = await supabase
    .from("savings_log")
    .select("amount_saved, benefits(scene)")
    .eq("user_id", user.id);

  const usage: UsageEntry[] = (logs ?? []).map((l) => {
    const benefit = l.benefits as { scene: Scene } | null;
    return {
      scene: (benefit?.scene ?? "eat") as Scene,
      amount_saved: l.amount_saved,
    };
  });

  const { data: badges } = await supabase
    .from("badges")
    .select("code, criteria");
  const unlocked = evaluateBadges(usage, badges ?? []);
  if (unlocked.length) {
    await supabase.from("user_badges").upsert(
      unlocked.map((code) => ({ user_id: user.id, badge_code: code })),
      { onConflict: "user_id,badge_code", ignoreDuplicates: true },
    );
  }

  revalidatePath("/", "layout");
  return { ok: true as const, unlocked };
}

/** Save onboarding answers and mark the profile as onboarded. */
export async function completeOnboarding(input: {
  lifestyle: Lifestyle;
  locale: string;
  currency: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" as const };

  const { error } = await supabase
    .from("profiles")
    .update({
      lifestyle: input.lifestyle,
      locale: input.locale,
      currency: input.currency,
      onboarded: true,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Update profile preferences from the Profile screen. */
export async function updateProfile(input: {
  locale?: string;
  currency?: string;
  lifestyle?: Lifestyle;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" as const };

  const { error } = await supabase
    .from("profiles")
    .update(input)
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Post a review; best-effort auto-translate into the other locale. */
export async function postReview(input: {
  benefitId: string;
  rating: number;
  body: string;
  locale: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" as const };

  const translations: Record<string, string> = {};
  const other = input.locale === "ja" ? "en" : "ja";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      translations[other] = await translateText(input.body, other);
    } catch {
      // Non-fatal: store the review without a translation.
    }
  }

  const { error } = await supabase.from("reviews").insert({
    benefit_id: input.benefitId,
    user_id: user.id,
    rating: input.rating,
    body: input.body,
    locale: input.locale,
    translations,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Create a "Find a Buddy" post. */
export async function createBuddyPost(input: {
  title: string;
  body: string;
  benefitId: string | null;
  whenAt: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth" as const };

  const { error } = await supabase.from("buddy_posts").insert({
    user_id: user.id,
    title: input.title,
    body: input.body || null,
    benefit_id: input.benefitId,
    when_at: input.whenAt,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true as const };
}
