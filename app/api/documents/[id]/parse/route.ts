import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { parseBenefitsPdf } from "@/lib/ai/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST /api/documents/[id]/parse — AI-break-down an uploaded benefits PDF. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "auth" }, { status: 401 });

  const admin = (await sql`
    select is_admin from users where id = ${session.user.id} limit 1
  `) as { is_admin: boolean }[];
  if (!admin[0]?.is_admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "no_api_key" }, { status: 400 });

  const docs = (await sql`
    select id, storage_path from benefit_documents where id = ${id} limit 1
  `) as { id: string; storage_path: string }[];
  const doc = docs[0];
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await sql`
    update benefit_documents set status = 'parsing', error = null where id = ${id}
  `;

  try {
    const res = await fetch(doc.storage_path);
    if (!res.ok) throw new Error(`download failed (${res.status})`);
    const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");

    const benefits = await parseBenefitsPdf(base64);

    for (const b of benefits) {
      await sql`
        insert into benefits
          (document_id, scene, title, action, vendor, amount, discount_pct,
           details, base_locale, published)
        values
          (${id}, ${b.scene}::scene, ${b.title}, ${b.action}, ${b.vendor},
           ${b.amount}, ${b.discount_pct}, ${b.details}, 'en', true)
      `;
    }

    await sql`
      update benefit_documents
      set status = 'parsed', parsed_at = now()
      where id = ${id}
    `;

    return NextResponse.json({ ok: true, count: benefits.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "parse failed";
    await sql`
      update benefit_documents set status = 'failed', error = ${message}
      where id = ${id}
    `;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
