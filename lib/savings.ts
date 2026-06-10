import type { Scene } from "@/lib/scenes";
import type { Tables } from "@/lib/database.types";

/** Notional spend per scene, used to estimate savings for %-discount perks. */
const NOTIONAL_SPEND: Record<Scene, number> = {
  eat: 1500,
  move_learn: 2000,
  relax_play: 3000,
  life_events: 0,
};

/**
 * Best-effort default "amount saved" for a single use of a benefit.
 * Fixed-amount perks use their amount; percentage perks estimate from a
 * notional scene spend. Users can override this when logging a use.
 */
export function estimateSaving(
  benefit: Pick<Tables<"benefits">, "amount" | "discount_pct" | "scene">,
): number {
  if (benefit.amount != null) return Math.round(benefit.amount);
  if (benefit.discount_pct != null) {
    return Math.round(
      (NOTIONAL_SPEND[benefit.scene] * benefit.discount_pct) / 100,
    );
  }
  return 0;
}

export type BadgeCriteria =
  | { type: "uses"; count: number }
  | { type: "scene_count"; scene: Scene; count: number }
  | { type: "distinct_scenes"; count: number }
  | { type: "total_saved"; amount: number };

export type UsageEntry = { scene: Scene; amount_saved: number };

/** Returns the badge codes that the given usage history satisfies. */
export function evaluateBadges(
  usage: UsageEntry[],
  badges: { code: string; criteria: unknown }[],
): string[] {
  const totalUses = usage.length;
  const totalSaved = usage.reduce((sum, u) => sum + (u.amount_saved || 0), 0);
  const perScene = usage.reduce<Record<string, number>>((acc, u) => {
    acc[u.scene] = (acc[u.scene] || 0) + 1;
    return acc;
  }, {});
  const distinctScenes = Object.keys(perScene).length;

  const unlocked: string[] = [];
  for (const badge of badges) {
    const c = badge.criteria as BadgeCriteria;
    let ok = false;
    switch (c?.type) {
      case "uses":
        ok = totalUses >= c.count;
        break;
      case "scene_count":
        ok = (perScene[c.scene] || 0) >= c.count;
        break;
      case "distinct_scenes":
        ok = distinctScenes >= c.count;
        break;
      case "total_saved":
        ok = totalSaved >= c.amount;
        break;
    }
    if (ok) unlocked.push(badge.code);
  }
  return unlocked;
}
