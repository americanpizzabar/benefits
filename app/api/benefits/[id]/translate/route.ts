import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
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

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "auth" }, { status: 401 });

  if (!routing.locales.includes(target as (typeof routing.locales)[number]))
    return NextResponse.json({ error: "bad_locale" }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "no_api_key" }, { status: 400 });

  const rows = (await sql`
    select title, action, details, base_locale from benefits where id = ${id} limit 1
  `) as {
    title: string;
    action: string | null;
    details: string | null;
    base_locale: string;
  }[];
  const benefit = rows[0];
  if (!benefit) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (benefit.base_locale === target)
    return NextResponse.json({ ok: true, skipped: true });

  try {
    const tr = await translateBenefit(
      { title: benefit.title, action: benefit.action, details: benefit.details },
      target,
    );
    await sql`
      insert into benefit_translations
        (benefit_id, locale, title, action, details, context_tip)
      values
        (${id}, ${target}, ${tr.title}, ${tr.action}, ${tr.details}, ${tr.context_tip})
      on conflict (benefit_id, locale) do update set
        title = excluded.title,
        action = excluded.action,
        details = excluded.details,
        context_tip = excluded.context_tip
    `;
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "translate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
