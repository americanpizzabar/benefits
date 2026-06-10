import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { translateBenefit } from "@/lib/ai/anthropic";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/benefits/[id]/translate?locale=ja
 * Generate & cache an AI translation (with cultural context tip) for a benefit.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const target = new URL(req.url).searchParams.get("locale") ?? "";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  if (!routing.locales.includes(target as (typeof routing.locales)[number]))
    return NextResponse.json({ error: "bad_locale" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "no_api_key" }, { status: 400 });

  const { data: benefit } = await supabase
    .from("benefits")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!benefit) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (benefit.base_locale === target)
    return NextResponse.json({ ok: true, skipped: true });

  try {
    const tr = await translateBenefit(
      { title: benefit.title, action: benefit.action, details: benefit.details },
      target,
    );
    await supabase.from("benefit_translations").upsert(
      {
        benefit_id: id,
        locale: target,
        title: tr.title,
        action: tr.action,
        details: tr.details,
        context_tip: tr.context_tip,
      },
      { onConflict: "benefit_id,locale" },
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "translate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
