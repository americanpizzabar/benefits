import type { Enums } from "@/lib/database.types";

export type Scene = Enums<"scene">;

export const SCENES: Scene[] = [
  "eat",
  "move_learn",
  "relax_play",
  "life_events",
];

/** Visual metadata for each lifestyle scene (emoji + Tailwind gradient). */
export const SCENE_META: Record<
  Scene,
  { emoji: string; gradient: string; accent: string }
> = {
  eat: {
    emoji: "🍜",
    gradient: "from-orange-400 to-rose-400",
    accent: "text-orange-600",
  },
  move_learn: {
    emoji: "💪",
    gradient: "from-emerald-400 to-teal-500",
    accent: "text-emerald-600",
  },
  relax_play: {
    emoji: "🎬",
    gradient: "from-indigo-400 to-violet-500",
    accent: "text-indigo-600",
  },
  life_events: {
    emoji: "🎀",
    gradient: "from-pink-400 to-fuchsia-500",
    accent: "text-pink-600",
  },
};

export function isScene(value: string): value is Scene {
  return (SCENES as string[]).includes(value);
}
