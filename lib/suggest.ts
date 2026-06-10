import type { Tables } from "@/lib/database.types";
import type { Scene } from "@/lib/scenes";

export type Lifestyle = {
  dining?: "eat_out" | "cook";
  activity?: "indoor" | "outdoor";
  family?: "single" | "couple" | "kids";
};

type Benefit = Tables<"benefits">;
type BenefitLike = Pick<Benefit, "scene" | "amount" | "discount_pct">;

/** Season from month (northern hemisphere / Japan). */
function season(month: number): "spring" | "summer" | "autumn" | "winter" {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

/**
 * Score a benefit for "right now" based on time of day, weekday/weekend,
 * season and the user's lifestyle profile. Higher = more relevant.
 */
export function scoreBenefit(
  benefit: BenefitLike,
  lifestyle: Lifestyle,
  now: Date = new Date(),
): number {
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sun
  const isWeekend = day === 0 || day === 6;
  const scene = benefit.scene as Scene;
  let score = 1;

  // Time-of-day cues
  if (scene === "eat" && hour >= 10 && hour <= 14) score += 4; // lunchtime
  if (scene === "eat" && hour >= 17 && hour <= 21) score += 2; // dinner
  if (scene === "relax_play" && (isWeekend || hour >= 17)) score += 3; // evenings/weekends
  if (scene === "move_learn" && (hour >= 6 && hour <= 9)) score += 2; // morning
  if (scene === "move_learn" && isWeekend) score += 1;

  // Lifestyle alignment
  if (scene === "eat" && lifestyle.dining === "eat_out") score += 2;
  if (scene === "relax_play" && lifestyle.activity === "outdoor") score += 1;
  if (scene === "move_learn" && lifestyle.activity === "indoor") score += 1;
  if (scene === "life_events" && lifestyle.family === "kids") score += 3;

  // Seasonal nudge: hotels/leisure in summer
  if (season(now.getMonth()) === "summer" && scene === "relax_play") score += 1;

  return score;
}

export type Suggestion<T extends BenefitLike> = {
  benefit: T;
  score: number;
  reasonKey: string;
};

/** Pick the single best "Today's benefit". */
export function todaysPick<T extends BenefitLike>(
  benefits: T[],
  lifestyle: Lifestyle,
  now: Date = new Date(),
): Suggestion<T> | null {
  if (benefits.length === 0) return null;
  const ranked = benefits
    .map((benefit) => ({
      benefit,
      score: scoreBenefit(benefit, lifestyle, now),
    }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  let reasonKey = "default";
  if (top.benefit.scene === "eat" && hour >= 10 && hour <= 14)
    reasonKey = "lunch";
  else if (top.benefit.scene === "relax_play" && isWeekend)
    reasonKey = "weekend";
  else if (top.benefit.scene === "relax_play" && hour >= 17)
    reasonKey = "evening";
  else if (top.benefit.scene === "move_learn" && hour <= 9)
    reasonKey = "morning";

  return { ...top, reasonKey };
}

/** Re-rank a full list so lifestyle-relevant perks float to the top. */
export function rankForUser<T extends BenefitLike>(
  benefits: T[],
  lifestyle: Lifestyle,
  now: Date = new Date(),
): T[] {
  return [...benefits].sort(
    (a, b) =>
      scoreBenefit(b, lifestyle, now) - scoreBenefit(a, lifestyle, now),
  );
}
