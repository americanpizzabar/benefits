import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseBenefitsPdf } from "@/lib/ai/anthropic";

export const runtime = "nodejs";
export const maxDuration = 60;

/** POST /api/documents/[id]/parse — AI-break-down an uploaded benefits PDF. */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "auth" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin)
    return NextResponse.json({ error: "forbidden" }, { status: 403 });

  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json({ error: "no_api_key" }, { status: 400 });

  const { data: doc } = await supabase
    .from("benefit_documents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await supabase
    .from("benefit_documents")
    .update({ status: "parsing", error: null })
    .eq("id", id);

  try {
    const { data: file, error: dlError } = await supabase.storage
      .from("benefit-pdfs")
      .download(doc.storage_path);
    if (dlError || !file) throw new Error(dlError?.message ?? "download failed");

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const benefits = await parseBenefitsPdf(base64);

    if (benefits.length > 0) {
      await supabase.from("benefits").insert(
        benefits.map((b) => ({
          document_id: id,
          scene: b.scene,
          title: b.title,
          action: b.action,
          vendor: b.vendor,
          amount: b.amount,
          discount_pct: b.discount_pct,
          details: b.details,
          base_locale: "en",
          published: true,
        })),
      );
    }

    await supabase
      .from("benefit_documents")
      .update({ status: "parsed", parsed_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true, count: benefits.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : "parse failed";
    await supabase
      .from("benefit_documents")
      .update({ status: "failed", error: message })
      .eq("id", id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
