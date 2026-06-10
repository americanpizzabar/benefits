import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { SCENE_META, type Scene } from "@/lib/scenes";

export function SceneTile({ scene }: { scene: Scene }) {
  const t = useTranslations("Scenes");
  const meta = SCENE_META[scene];
  return (
    <Link
      href={`/scene/${scene}`}
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${meta.gradient} p-4 text-white aspect-[5/4] active:scale-[0.98] transition-transform`}
    >
      <span className="text-3xl">{meta.emoji}</span>
      <span>
        <span className="block text-lg font-bold leading-tight">
          {t(scene)}
        </span>
        <span className="block text-xs/4 text-white/85">
          {t(`${scene}Sub`)}
        </span>
      </span>
    </Link>
  );
}
