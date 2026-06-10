"use server";

import { revalidatePath } from "next/cache";
import { auth, signOut as authSignOut } from "@/auth";
import { sql } from "@/lib/db";
import { evaluateBadges, type UsageEntry } from "@/lib/savings";
import { translateText } from "@/lib/ai/anthropic";
import type { Scene } from "@/lib/scenes";
import type { Lifestyle } from "@/lib/suggest";

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Log a use of a benefit and unlock any newly-earned badges. */
export async function logBenefitUse(benefitId: string, amount: number) {
  const userId = await currentUserId();
  if (!userId) return { error: "auth" as const };

  await sql`
    insert into savings_log (user_id, benefit_id, amount_saved)
    values (${userId}, ${benefitId}, ${Math.max(0, Math.round(amount))})
  `;

  // Re-evaluate badges from full history.
  const logs = (await sql`
    select s.amount_saved, b.scene
    from savings_log s join benefits b on b.id = s.benefit_id
    where s.user_id = ${userId}
  `) as { amount_saved: number; scene: Scene }[];

  const usage: UsageEntry[] = logs.map((l) => ({
    scene: (l.scene ?? "eat") as Scene,
    amount_saved: Number(l.amount_saved),
  }));

  const badges = (await sql`select code, criteria from badges`) as {
    code: string;
    criteria: unknown;
  }[];
  const unlocked = evaluateBadges(usage, badges);
  for (const code of unlocked) {
    await sql`
      insert into user_badges (user_id, badge_code)
      values (${userId}, ${code})
      on conflict (user_id, badge_code) do nothing
    `;
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
  const userId = await currentUserId();
  if (!userId) return { error: "auth" as const };

  await sql`
    update users set
      lifestyle = ${JSON.stringify(input.lifestyle)}::jsonb,
      locale = ${input.locale},
      currency = ${input.currency},
      onboarded = true
    where id = ${userId}
  `;

  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Update profile preferences from the Profile screen. */
export async function updateProfile(input: {
  locale?: string;
  currency?: string;
  lifestyle?: Lifestyle;
}) {
  const userId = await currentUserId();
  if (!userId) return { error: "auth" as const };

  await sql`
    update users set
      locale = coalesce(${input.locale ?? null}, locale),
      currency = coalesce(${input.currency ?? null}, currency),
      lifestyle = coalesce(
        ${input.lifestyle ? JSON.stringify(input.lifestyle) : null}::jsonb,
        lifestyle
      )
    where id = ${userId}
  `;

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
  const userId = await currentUserId();
  if (!userId) return { error: "auth" as const };

  const translations: Record<string, string> = {};
  const other = input.locale === "ja" ? "en" : "ja";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      translations[other] = await translateText(input.body, other);
    } catch {
      // Non-fatal: store the review without a translation.
    }
  }

  await sql`
    insert into reviews (benefit_id, user_id, rating, body, locale, translations)
    values (
      ${input.benefitId}, ${userId}, ${input.rating}, ${input.body},
      ${input.locale}, ${JSON.stringify(translations)}::jsonb
    )
  `;

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
  const userId = await currentUserId();
  if (!userId) return { error: "auth" as const };

  await sql`
    insert into buddy_posts (user_id, title, body, benefit_id, when_at)
    values (
      ${userId}, ${input.title}, ${input.body || null},
      ${input.benefitId}, ${input.whenAt}
    )
  `;

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function signOut() {
  await authSignOut({ redirect: false });
  revalidatePath("/", "layout");
  return { ok: true as const };
}
